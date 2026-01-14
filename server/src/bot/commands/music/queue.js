const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Displays the current music queue.'),
    async execute(interaction) {
        const queue = useQueue(interaction.guild.id);

        if (!queue || !queue.tracks.toArray().length) {
            return interaction.reply('The queue is empty!');
        }

        const tracks = queue.tracks.toArray().map((track, i) => {
            return `${i + 1}. **${track.title}** - ${track.author}`;
        }).slice(0, 10); // Show top 10

        const embed = new EmbedBuilder()
            .setTitle('Queue')
            .setDescription(tracks.join('\n'))
            .setFooter({ text: `And ${queue.tracks.toArray().length - tracks.length} more...` });

        return interaction.reply({ embeds: [embed] });
    },
};
