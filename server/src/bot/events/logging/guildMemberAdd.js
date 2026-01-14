const { Events } = require('discord.js');
const { sendLog } = require('../../../utils/logger');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        // Logging Logic
        const accountAge = Math.floor((Date.now() - member.user.createdTimestamp) / (1000 * 60 * 60 * 24));
        const embed = {
            color: 0x00FF00, // Green
            title: '👋 Member Joined',
            description: `${member} (${member.user.tag}) joined the server.`,
            thumbnail: { url: member.user.displayAvatarURL() },
            fields: [
                { name: 'Account Age', value: `${accountAge} days old`, inline: true },
                { name: 'User ID', value: member.id, inline: true }
            ]
        };
        await sendLog(member.guild, 'memberAdd', embed);

        // Welcome Module Logic
        try {
            const Guild = require('../../../models/Guild');
            const settings = await Guild.findOne({ guildId: member.guild.id });

            if (settings && settings.welcomeConfig && settings.welcomeConfig.enabled) {
                const { channelId, message, autoRoleId } = settings.welcomeConfig;

                // Send Welcome Message
                if (channelId && message) {
                    const channel = member.guild.channels.cache.get(channelId);
                    if (channel) {
                        const formattedMessage = message
                            .replace(/{user}/g, member.toString())
                            .replace(/{server}/g, member.guild.name)
                            .replace(/{count}/g, member.guild.memberCount);
                        await channel.send(formattedMessage);
                    }
                }

                // Auto Role
                if (autoRoleId) {
                    const role = member.guild.roles.cache.get(autoRoleId);
                    if (role) {
                        await member.roles.add(role).catch(err => console.error(`Failed to assign auto-role: ${err.message}`));
                    }
                }
            }
        } catch (err) {
            console.error(`Welcome module error: ${err.message}`);
        }
    },
};
