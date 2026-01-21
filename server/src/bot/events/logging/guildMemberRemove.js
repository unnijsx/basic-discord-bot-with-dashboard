const { Events } = require('discord.js');
const { logAction } = require('../../../utils/auditLogger');

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
        await logAction(
            member.guild.id,
            'MEMBER_LEAVE',
            member.user,
            'Left server',
            null,
            member.client
        );
    },
};
