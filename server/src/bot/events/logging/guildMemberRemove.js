const { Events } = require('discord.js');
const { sendLog } = require('../../../utils/logger');

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
        const embed = {
            color: 0xFF0000, // Red
            title: '👋 Member Left',
            description: `**${member.user.tag}** left the server.`,
            thumbnail: { url: member.user.displayAvatarURL() },
            footer: { text: `ID: ${member.id}` }
        };

        await sendLog(member.guild, 'memberRemove', embed);
    },
};
