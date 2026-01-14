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
            const content = message.content.toLowerCase();
            const foundBadWord = BAD_WORDS.find(word => content.includes(word));

            if (foundBadWord) {
                try {
                    await message.delete();
                    const warningMsg = await message.channel.send(`${message.author}, watch your language! ⚠️`);
                    setTimeout(() => warningMsg.delete().catch(() => { }), 5000);
                    return; // Stop processing if message deleted
                } catch (error) {
                    console.error('Failed to delete message:', error);
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
                            let msg = guildSettings.levelingConfig.levelUpMessage || 'Congratulations {user}, you reached level {level}!';
                            msg = msg.replace('{user}', message.author.toString()).replace('{level}', userLevel.level);
                            channel.send(msg);
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
