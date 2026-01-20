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
async function logAction(guildId, action, executor, changes, target = null, client = null) {
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

        // 2. Send to Log Channel (if client provided)
        if (client) {
            const config = await Guild.findOne({ guildId });
            if (config?.loggingConfig?.logChannelId) {
                const channel = client.channels.cache.get(config.loggingConfig.logChannelId);
                if (channel) {
                    const { EmbedBuilder } = require('discord.js');
                    const logEmbed = new EmbedBuilder()
                        .setColor('#ff9900')
                        .setTitle(`🛡️ Action: ${action}`)
                        .addFields(
                            { name: 'Executor', value: `${executor.username} (${executor.id})`, inline: true },
                            { name: 'Target', value: target ? `${target.username} (${target.id})` : 'N/A', inline: true },
                            { name: 'Details', value: typeof changes === 'string' ? changes : JSON.stringify(changes, null, 2).substring(0, 1020) || 'None' }
                        )
                        .setTimestamp();

                    channel.send({ embeds: [logEmbed] }).catch(err => console.error('Failed to send log message:', err));
                }
            }
        }

    } catch (error) {
        console.error('Failed to log action:', error);
    }
}

module.exports = { logAction };