const { Events } = require('discord.js');
const { logAction } = require('../../../utils/auditLogger');

module.exports = {
    name: Events.MessageDelete,
    async execute(message) {
        if (!message.guild || message.author?.bot) return;

        // Logging
        await logAction(
            message.guild.id,
            'MESSAGE_DELETE',
            { id: 'Unknown', username: 'Unknown' }, // Executor unknown for message delete event
            { content: message.content },
            message.author,
            message.client
        );
    },
};
