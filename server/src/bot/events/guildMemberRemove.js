const { Events } = require('discord.js');
const analytics = require('../../utils/analytics');

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
        analytics.trackLeave(member.guild.id);
    },
};
