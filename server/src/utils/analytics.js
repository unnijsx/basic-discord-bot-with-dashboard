const Analytics = require('../models/Analytics');

async function getTodayStats(guildId) {
    const today = new Date().toISOString().split('T')[0];
    let stats = await Analytics.findOne({ guildId, date: today });
    if (!stats) {
        stats = new Analytics({ guildId, date: today });
        await stats.save();
    }
    return stats;
}

module.exports = {
    trackMessage: async (guildId, userId) => {
        try {
            const stats = await getTodayStats(guildId);
            stats.messagesSent++;
            // Simple unique check could be expensive if array, but for MVP just increment count
            // To track unique active users, we would need a Set in DB or auxiliary collection.
            // For now, let's just count total messages. ActiveUsers is harder without separate table.
            await stats.save();
        } catch (err) {
            console.error('Analytics Error:', err);
        }
    },
    trackJoin: async (guildId) => {
        try {
            const stats = await getTodayStats(guildId);
            stats.membersJoined++;
            await stats.save();
        } catch (err) { console.error(err); }
    },
    trackLeave: async (guildId) => {
        try {
            const stats = await getTodayStats(guildId);
            stats.membersLeft++;
            await stats.save();
        } catch (err) { console.error(err); }
    }
};
