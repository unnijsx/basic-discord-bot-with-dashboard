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
            if (!config || !config.loggingConfig.logChannelId) return;

            // Check if specific log type is enabled
            const typeMap = {
                'MESSAGE_DELETE': 'logMessageDelete',
                'MESSAGE_UPDATE': 'logMessageEdit',
                'MEMBER_JOIN': 'logMemberJoin',
                'MEMBER_LEAVE': 'logMemberLeave',
                'VOICE_STATE': 'logVoiceState'
            };

            if (typeMap[action] && !config.loggingConfig[typeMap[action]]) return;

            const channel = client.channels.cache.get(config.loggingConfig.logChannelId);
            if (channel) {
                const { EmbedBuilder } = require('discord.js');

                // Construct Embed based on action
                const embed = new EmbedBuilder()
                    .setTimestamp()
                    .setFooter({ text: 'Audit Log' });

                switch (action) {
                    case 'MESSAGE_DELETE':
                        embed.setColor('#ff4d4f') // Red
                            .setTitle('🗑️ Message Deleted')
                            .setDescription(`**Message sent by <@${target ? target.id : 'Unknown'}> deleted**`)
                            .addFields({ name: 'Content', value: (changes.content ? changes.content.substring(0, 1024) : '[No Content]') });
                        break;

                    case 'MESSAGE_UPDATE':
                        embed.setColor('#faad14') // Orange
                            .setTitle('✏️ Message Edited')
                            .setDescription(`**Message edited by <@${executor.id}>** [Jump](${changes.url})`)
                            .addFields(
                                { name: 'Before', value: changes.oldContent?.substring(0, 1024) || '[None]' },
                                { name: 'After', value: changes.newContent?.substring(0, 1024) || '[None]' }
                            );
                        break;

                    case 'MEMBER_JOIN':
                        embed.setColor('#52c41a') // Green
                            .setTitle('📥 Member Joined')
                            .setDescription(`${executor.username} (${executor.id}) joined the server.`);
                        break;

                    case 'MEMBER_LEAVE':
                        embed.setColor('#f5222d') // Red
                            .setTitle('📤 Member Left')
                            .setDescription(`${executor.username} (${executor.id}) left the server.`);
                        break;

                    case 'VOICE_STATE':
                        embed.setColor('#1890ff') // Blue
                            .setTitle('🎤 Voice State Update')
                            .setDescription(`${executor.username} **${changes}**`);
                        break;

                    default:
                        embed.setColor('#ff9900')
                            .setTitle(`🛡️ Action: ${action}`)
                            .addFields(
                                { name: 'Executor', value: `${executor.username} (${executor.id})`, inline: true },
                                { name: 'Details', value: typeof changes === 'string' ? changes : JSON.stringify(changes, null, 2).substring(0, 1020) || 'None' }
                            );
                }

                channel.send({ embeds: [embed] }).catch(err => console.error('Failed to send log message:', err));
            }
        }

    } catch (error) {
        console.error('Failed to log action:', error);
    }
}

module.exports = { logAction };