const { EmbedBuilder } = require('discord.js');
const Guild = require('../models/Guild');

async function sendLog(guild, type, embedData) {
    try {
        const settings = await Guild.findOne({ guildId: guild.id });
        if (!settings || !settings.modules.logging) return;

        const config = settings.loggingConfig;
        if (!config.logChannelId) return;

        // Check if specific log type is enabled
        // Map type to config key
        const typeMap = {
            'messageDelete': 'logMessageDelete',
            'messageUpdate': 'logMessageEdit',
            'memberAdd': 'logMemberJoin',
            'memberRemove': 'logMemberLeave'
        };

        if (typeMap[type] && !config[typeMap[type]]) return;

        const channel = guild.channels.cache.get(config.logChannelId);
        if (!channel) return;

        const embed = new EmbedBuilder(embedData)
            .setTimestamp()
            .setFooter({ text: 'Logging Module' });

        await channel.send({ embeds: [embed] });

    } catch (error) {
        console.error('Logging Error:', error);
    }
}

module.exports = { sendLog };
