const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('support')
        .setDescription('Get the link to the support server'),
    async execute(interaction) {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Join Support Server')
                    .setStyle(ButtonStyle.Link)
                    .setURL(process.env.DISCORD_SUPPORT_SERVER || 'https://discord.gg/your-invite')
            );

        await interaction.reply({
            content: 'Need help? Join our support server!',
            components: [row]
        });
    },
};
