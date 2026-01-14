const { Events } = require('discord.js');
const { sendLog } = require('../../../utils/logger');

module.exports = {
    name: Events.MessageUpdate,
    async execute(oldMessage, newMessage) {
        if (!oldMessage.guild || oldMessage.author?.bot) return;
        if (oldMessage.content === newMessage.content) return; // Ignore embeds updates

        const embed = {
            color: 0xFFA500, // Orange
            title: '✏️ Message Edited',
            description: `**Message edited in ${oldMessage.channel}** [Jump to Message](${newMessage.url})`,
            fields: [
                { name: 'Before', value: oldMessage.content || '[No Content]' },
                { name: 'After', value: newMessage.content || '[No Content]' }
            ],
            author: {
                name: oldMessage.author.tag,
                icon_url: oldMessage.author.displayAvatarURL()
            }
        };

        await sendLog(oldMessage.guild, 'messageUpdate', embed);
    },
};
