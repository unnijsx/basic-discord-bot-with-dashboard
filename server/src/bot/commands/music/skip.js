const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skips the current song.'),
    async execute(interaction, client) {
        const node = client.shoukaku.getNode();
        const player = node?.players.get(interaction.guild.id);

        if (!player) return interaction.reply({ content: 'Nothing is playing.', ephemeral: true });

        await player.stopTrack();
        return interaction.reply('⏭️ Skipped current track.');
    },
};
