const { Events } = require('discord.js');
const analytics = require('../../utils/analytics');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        analytics.trackJoin(member.guild.id);
    },
};
