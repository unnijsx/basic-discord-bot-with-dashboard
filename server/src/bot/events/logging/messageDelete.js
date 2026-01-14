const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const { sendLog } = require('../../../utils/logger');

module.exports = {
    name: Events.MessageDelete,
    async execute(message) {
        if (!message.guild || message.author?.bot) return;

        const embed = {
            color: 0xFF4500, // Orange Red
            title: '🗑️ Message Deleted',
            description: `**Message sent by ${message.author} deleted in ${message.channel}**\n${message.content || '[No Content/Image]'}`,
            author: {
                name: message.author.tag,
                icon_url: message.author.displayAvatarURL()
            }
            // Note: Fetching audit logs to find "who" deleted it is complex due to latency/caching
        };

        await sendLog(message.guild, 'messageDelete', embed);
    },
};
