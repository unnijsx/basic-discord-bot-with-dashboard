const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Displays the current music queue.'),
    async execute(interaction, client) {
        return interaction.reply({ content: '📜 Queue is currently managed by the Lavalink node (Simpler version enabled).', ephemeral: true });
    },
};
