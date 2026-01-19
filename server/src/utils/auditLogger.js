const AuditLog = require('../models/AuditLog');
const Guild = require('../models/Guild');

/**
 * Logs an action to the database and optionally sends a log message to a Discord channel.
 * @param {string} guildId - ID of the guild
 * @param {string} action - Action type (e.g., MEMBER_BAN)
 * @param {object} executor - User object { id, username, discriminator, tag }
 * @param {object|string} changes - Details or changes object
 * @param {object|null} target - Optional target user { id, username }
 */
async function logAction(guildId, action, executor, changes, target = null) {
    try {
        // 1. Save to Database
        const newLog = new AuditLog({
            guildId,
            action,
            executorId: executor.id,
            executorName: executor.username || 'Unknown',
            targetId: target?.id,
            targetName: target?.username,
            changes,
            timestamp: new Date()
        });
        await newLog.save();

        // 2. Send to Log Channel (if configured)
        // We need access to the client. This file is a utility, so we might need to pass client or rely on a global/singleton.
        // For now, let's just focus on saving to DB. 
        // If we want to send to Discord, we'd need to fetch the guild config.

        // Example logic for future expansion:
        // const config = await Guild.findOne({ guildId });
        // if (config?.loggingConfig?.logChannelId) { ... }

    } catch (error) {
        console.error('Failed to log action:', error);
    }
}

module.exports = { logAction };