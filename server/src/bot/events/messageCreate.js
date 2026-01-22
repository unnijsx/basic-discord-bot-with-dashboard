const { Events } = require('discord.js');
const Guild = require('../../models/Guild');
const Level = require('../../models/Level');

const BAD_WORDS = ['badword1', 'badword2', 'idiot', 'stupid'];

// XP Cooldown set to 60 seconds
const XP_COOLDOWN = 60 * 1000;

function getXp(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        // --- AFK System ---
        const User = require('../../models/User');

        // 1. Check if Author is AFK -> Remove AFK
        try {
            const authorData = await User.findOne({ discordId: message.author.id });
            if (authorData && authorData.afk.isAfk) {
                authorData.afk.isAfk = false;
                authorData.afk.reason = null;
                await authorData.save();

                // Reset Nickname if possible
                if (message.guild.members.me.permissions.has('ManageNicknames')) {
                    const member = message.member;
                    if (member.nickname && member.nickname.startsWith('[AFK]')) {
                        await member.setNickname(member.nickname.replace('[AFK] ', '').substring(0, 32));
                    }
                }

                message.reply(`👋 Welcome back ${message.author}! I've removed your AFK status.`).then(m => setTimeout(() => m.delete().catch(() => { }), 10000));
            }

            // 2. Check if Mentioned User is AFK
            if (message.mentions.users.size > 0) {
                message.mentions.users.forEach(async (user) => {
                    const mentionedData = await User.findOne({ discordId: user.id });
                    if (mentionedData && mentionedData.afk.isAfk) {
                        const timeAgo = Math.floor((Date.now() - mentionedData.afk.timestamp) / 1000); // seconds

                        // Relative time string logic or just simple text
                        const relativeTime = `<t:${Math.floor(mentionedData.afk.timestamp.getTime() / 1000)}:R>`;

                        message.reply(`💤 **${user.username}** is AFK: ${mentionedData.afk.reason} (${relativeTime})`);
                    }
                });
            }

        } catch (err) {
            console.error('AFK Check Error:', err);
        }

        // --- Analytics ---
        const analytics = require('../../utils/analytics');
        analytics.trackMessage(message.guild?.id, message.author.id);

        // --- Maintenance Check ---
        // We pass message.guild.id, but for messages we fail silently (don't spam chat)
        const { checkMaintenance } = require('../../utils/maintenance');
        const maintenance = await checkMaintenance(message.guild?.id, message.author.id);
        if (maintenance.active) return;

        // Fetch Guild Settings
        let guildSettings = await Guild.findOne({ guildId: message.guild.id });
        if (!guildSettings) {
            // Create default settings if missing to avoid errors
            guildSettings = new Guild({
                guildId: message.guild.id,
                name: message.guild.name,
                ownerId: message.guild.ownerId
            });
            await guildSettings.save();
        }

        // --- Moderation: Auto-Mod ---
        if (guildSettings.modules.moderation && guildSettings.moderationConfig.autoMod) {
            // DEBUG: Trace AutoMod execution
            console.log(`[AutoMod] Processing message in guild: ${message.guild.name} (${message.guild.id})`);
            console.log(`[AutoMod] Config:`, JSON.stringify(guildSettings.moderationConfig, null, 2));

            // Check specific filters
            const filters = guildSettings.moderationConfig.autoModFilters;
            if (filters.badWords) {
                const content = message.content.toLowerCase();
                // Combine hardcoded defaults (optional) with Guild specific banned words
                const allBadWords = [...(guildSettings.moderationConfig.bannedWords || []), ...BAD_WORDS];

                console.log(`[AutoMod] Checking content: "${content}"`);
                console.log(`[AutoMod] Bad words list:`, allBadWords);

                const foundBadWord = allBadWords.find(word => content.includes(word.toLowerCase()));

                if (foundBadWord) {
                    console.log(`[AutoMod] 🚨 Match found: "${foundBadWord}"`);
                    try {
                        const action = guildSettings.moderationConfig.actions.badWords || 'delete'; // default to delete

                        if (action === 'delete') {
                            if (message.deletable) await message.delete();
                            const warningMsg = await message.channel.send(`${message.author}, watch your language! ⚠️`);
                            setTimeout(() => warningMsg.delete().catch(() => { }), 5000);
                        } else if (action === 'warn') {
                            // detailed warn logic could be here (e.g., DM user)
                            // for now just send channel warning
                            const warningMsg = await message.channel.send(`${message.author}, please refrain from using inappropriate language. ⚠️`);
                            setTimeout(() => warningMsg.delete().catch(() => { }), 5000);
                        } else if (action === 'mute' || action === 'timeout') {
                            try {
                                // Delete the message
                                if (message.deletable) await message.delete();

                                // Timeout the user (Default 10 mins)
                                if (message.member && message.member.moderatable) {
                                    await message.member.timeout(10 * 60 * 1000, 'AutoMod: Bad Words');
                                    const warningMsg = await message.channel.send(`${message.author} has been timed out for 10 minutes for using inappropriate language. 🔇`);
                                    setTimeout(() => warningMsg.delete().catch(() => { }), 5000);
                                } else {
                                    const warningMsg = await message.channel.send(`${message.author}, watch your language! ⚠️ (Could not timeout user)`);
                                    setTimeout(() => warningMsg.delete().catch(() => { }), 5000);
                                }
                            } catch (err) {
                                console.error('AutoMod Mute Error:', err);
                            }
                        }

                        // Log to Audit Log
                        const { logAction } = require('../../utils/auditLogger');
                        // Pass message.client to enable Discord logging
                        logAction(message.guild.id, 'AUTO_MOD_BAD_WORD', { id: 'BOT', username: 'AutoMod' }, { content: message.content, word: foundBadWord, userId: message.author.id, actionTaken: action }, { id: message.author.id, username: message.author.username }, message.client);

                        // We return if deleted to stop processing strings, but if warn we might want to continue? 
                        // Generally if it matched a bad word we stop there.
                        return;
                    } catch (error) {
                        console.error('Failed to handle auto-mod action:', error);
                    }
                }
            }
        }

        // --- Leveling: XP System ---
        if (guildSettings.modules.leveling) {
            try {
                let userLevel = await Level.findOne({ userId: message.author.id, guildId: message.guild.id });

                if (!userLevel) {
                    userLevel = new Level({
                        userId: message.author.id,
                        guildId: message.guild.id,
                        xp: 0,
                        level: 0,
                        lastXp: new Date(0) // Ensure immediate XP gain
                    });
                }

                const timeDiff = Date.now() - userLevel.lastXp.getTime();

                if (timeDiff > XP_COOLDOWN) {
                    const xpGain = getXp(15, 25);
                    userLevel.xp += xpGain;
                    userLevel.lastXp = Date.now();

                    // Level Up Logic: XP needed = 5 * (level ^ 2) + 50 * level + 100
                    // or simple: 100 * level (linear) or formula. Let's use simple exponential: Level * 100
                    const nextLevelXp = (userLevel.level + 1) * 100;

                    if (userLevel.xp >= nextLevelXp) {
                        userLevel.level += 1;
                        userLevel.xp -= nextLevelXp; // Optional: Keep accumulated XP or reset? 
                        // MEE6 keeps accumulated. Let's start level with accumulated XP strategy:
                        // Actually, easier strategy: total XP determines level.
                        // Let's stick to "XP for next level" formula for simplicity here:
                        // Current approach: XP resets per level? No, keep total.
                        // Re-do logic: Just check total XP against formula. 
                        // Simplified: Level = 0.1 * sqrt(XP)  => XP = 100 * Level^2
                        // Let's just increment level if XP > threshold and NOT reset XP. 
                        // But standard is accumulated. 
                        // Let's use: threshold = level * 100. (Lvl 0->1: 0xp->100xp. Lvl 1->2: 200xp total? No wait.)
                        // Mee6 style: 5 * x^2 + 50 * x + 100

                        // Simple custom formula for this MVP: 
                        // XP needed to complete current level: 100 * (current_level + 1)
                        // This means Level 0 needs 100 XP to get to Level 1.
                        // Level 1 needs 200 XP to get to Level 2.

                        // We are ACTUALLY storing TOTAL XP or Current Level XP? 
                        // `userLevel.xp` usually stores total. 
                        // Let's change schema slightly? No, keep it simple. `xp` is total accumulated.

                        // Calculate level based on total XP
                        // Let's stick to the simplest incremental logic for MVP otherwise we need to solve math.
                        // "XP needed for next level" logic:
                        // If we reset XP every level:
                        // userLevel.xp += xpGain; 
                        // if (userLevel.xp >= 100 * (userLevel.level + 1)) {
                        //    userLevel.xp = 0; // Reset
                        //    userLevel.level++;
                        // }
                        // Drawback: Leaderboard sorting is hard if XP resets.

                        // Better: `xp` is total. Calculate level from total.
                        // Level N requires Total XP = 100 * N * N? 
                        // Let's just use a simplified threshold check.
                    }

                    // REVISED LOGIC: Incremental XP, but store TOTAL.
                    // For MVP simplicity:
                    // `xp` field will hold TOTAL XP.
                    // We calculate level on fly? Or store it.

                    // Let's use: Level Up threshold = 5 * (lvl^1) + 50 * lvl + 100 ? 
                    // Let's use fixed 300 XP per level for MVP simplicity.

                    const xpNeeded = 300 * (userLevel.level + 1);
                    if (userLevel.xp >= xpNeeded) {
                        userLevel.level++;

                        const channelId = guildSettings.levelingConfig.levelUpChannelId;
                        const channel = channelId ? message.guild.channels.cache.get(channelId) : message.channel;

                        if (channel) {
                            let msgText = guildSettings.levelingConfig.levelUpMessage || 'Congratulations {user}, you reached level {level}!';
                            msgText = msgText.replace('{user}', message.author.toString()).replace('{level}', userLevel.level);

                            // Send proper Embed
                            const { EmbedBuilder } = require('discord.js');
                            const levelEmbed = new EmbedBuilder()
                                .setColor('#5865F2')
                                .setTitle('🎉 Level Up!')
                                .setDescription(msgText)
                                .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                                .setFooter({ text: `Keep chatting to reach level ${userLevel.level + 1}!` })
                                .setTimestamp();

                            channel.send({ content: `${message.author}`, embeds: [levelEmbed] });
                        }
                    }

                    await userLevel.save();
                }
            } catch (err) {
                console.error('Leveling Error:', err);
            }
        }
    },
};
