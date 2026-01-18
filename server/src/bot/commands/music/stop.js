const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stops the music and clears the queue.'),
    async execute(interaction) {
        const client = interaction.client;
        const node = client.shoukaku.options.nodeResolver(client.shoukaku.nodes);
        if (!node) return interaction.reply({ content: 'Lavalink not ready.', ephemeral: true });

        const player = node.players.get(interaction.guild.id);
        if (!player) return interaction.reply({ content: 'I am not playing anything.', ephemeral: true });

        await client.shoukaku.leaveVoiceChannel(interaction.guild.id);
        return interaction.reply('⏹️ Stopped playback and left the channel.');
    },
};
