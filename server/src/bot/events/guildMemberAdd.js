const { Events, EmbedBuilder } = require('discord.js');
const analytics = require('../../utils/analytics');
const { logAction } = require('../../utils/auditLogger');

// In-memory Raid Tracker: GuildID -> Array of timestamps
const recentJoins = new Map();
const RAID_THRESHOLD = 5; // members
const RAID_TIME_WINDOW = 10000; // 10 seconds

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        analytics.trackJoin(member.guild.id);

        // --- Anti-Raid Logic ---
        const guildId = member.guild.id;
        const now = Date.now();

        if (!recentJoins.has(guildId)) {
            recentJoins.set(guildId, []);
        }

        const joins = recentJoins.get(guildId);
        // Filter out old joins
        const validJoins = joins.filter(timestamp => now - timestamp < RAID_TIME_WINDOW);

        validJoins.push(now);
        recentJoins.set(guildId, validJoins);

        if (validJoins.length > RAID_THRESHOLD) {
            // RAID DETECTED
            try {
                // 1. Kick the user
                if (member.kickable) {
                    await member.kick('Anti-Raid: Join speed threshold exceeded');
                }

                // 2. Alert (throttle alerts)
                if (validJoins.length === RAID_THRESHOLD + 1) { // Only log once per spike start
                    await logAction(guildId, 'AUTO_MOD_DELETE', { id: 'BOT', username: 'Anti-Raid' }, {
                        content: `⚠️ **RAID DETECTED!** >${RAID_THRESHOLD} joins in 10s. Kicking new joins.`
                    });

                    // Optional: Send alert to System Channel
                    const systemChannel = member.guild.systemChannel;
                    if (systemChannel) {
                        const embed = new EmbedBuilder()
                            .setTitle('🛡️ Anti-Raid Activated')
                            .setDescription('Join rate limit exceeded. Automatically kicking recent joins.')
                            .setColor('#FF0000');
                        systemChannel.send({ embeds: [embed] });
                    }
                }
            } catch (err) {
                console.error('Anti-Raid Error:', err);
            }
        }
    },
};
