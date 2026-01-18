const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skips the current song.'),
    async execute(interaction) {
        const client = interaction.client;
        const node = client.shoukaku.options.nodeResolver(client.shoukaku.nodes);
        const player = node?.players.get(interaction.guild.id);

        if (!player) return interaction.reply({ content: 'Nothing is playing.', ephemeral: true });

        await player.stopTrack();
        return interaction.reply('⏭️ Skipped current track.');
    },
};
