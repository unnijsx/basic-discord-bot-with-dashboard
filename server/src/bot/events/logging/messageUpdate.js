const { Events } = require('discord.js');
const { logAction } = require('../../../utils/auditLogger');

module.exports = {
    name: Events.MessageUpdate,
    async execute(oldMessage, newMessage) {
        if (!oldMessage.guild || oldMessage.author?.bot) return;
        if (oldMessage.content === newMessage.content) return;

        await logAction(
            oldMessage.guild.id,
            'MESSAGE_UPDATE',
            oldMessage.author,
            {
                oldContent: oldMessage.content,
                newContent: newMessage.content,
                url: newMessage.url
            },
            null,
            oldMessage.client
        );
    },
};
