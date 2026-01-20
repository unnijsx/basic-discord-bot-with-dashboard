const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('about')
        .setDescription('Shows info about the bot.'),
    async execute(interaction) {
        const client = interaction.client;

        const embed = new EmbedBuilder()
            .setTitle('🤖 About Rheox')
            .setDescription('Rheox is a development community established in 2022. We specialize in Bots, Websites, UI/UX, and 3D Arts.')
            .setThumbnail(client.user.displayAvatarURL())
            .setColor('#ffb7c5')
            .addFields(
                { name: 'Developer', value: '<@562859302130286613>', inline: true },
                { name: 'Version', value: 'v2.0', inline: true },
                { name: 'Library', value: 'Discord.js v14', inline: true },
                { name: 'Uptime', value: `<t:${Math.floor((Date.now() - client.uptime) / 1000)}:R>`, inline: true }
            )
            .setFooter({ text: 'Developed with ❤️ by the Rheox Team' });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Dashboard')
                    .setStyle(ButtonStyle.Link)
                    .setURL(process.env.FRONTEND_URL || 'https://basic-discord-bot-with-dashboard.vercel.app'),
                new ButtonBuilder()
                    .setLabel('Support Server')
                    .setStyle(ButtonStyle.Link)
                    .setURL(process.env.DISCORD_SUPPORT_SERVER || 'https://discord.gg/your-invite'),
                new ButtonBuilder()
                    .setLabel('Privacy')
                    .setStyle(ButtonStyle.Link)
                    .setURL(`${process.env.FRONTEND_URL || 'https://basic-discord-bot-with-dashboard.vercel.app'}/privacy`),
                new ButtonBuilder()
                    .setLabel('Terms')
                    .setStyle(ButtonStyle.Link)
                    .setURL(`${process.env.FRONTEND_URL || 'https://basic-discord-bot-with-dashboard.vercel.app'}/terms`)
            );

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};
