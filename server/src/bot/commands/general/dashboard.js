const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dashboard')
        .setDescription('Get the link to the web dashboard'),
    async execute(interaction) {
        const url = process.env.FRONTEND_URL || 'https://basic-discord-bot-with-dashboard.vercel.app';

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Open Dashboard')
                    .setStyle(ButtonStyle.Link)
                    .setURL(url)
            );

        await interaction.reply({
            content: 'Manage your server from our web dashboard!',
            components: [row]
        });
    },
};
