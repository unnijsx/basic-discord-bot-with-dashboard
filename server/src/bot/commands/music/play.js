const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays a song or playlist.')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('The song URL or name')
                .setRequired(true)),
    async execute(interaction) {
        const player = useMainPlayer();
        const channel = interaction.member.voice.channel;

        if (!channel) return interaction.reply('You are not connected to a voice channel!');
        if (!channel.joinable) return interaction.reply('I cannot join your voice channel!');

        await interaction.deferReply();
        const query = interaction.options.getString('query');

        try {
            const { track } = await player.play(channel, query, {
                nodeOptions: {
                    metadata: {
                        channel: interaction.channel,
                        client: interaction.guild.members.me,
                        requestedBy: interaction.user
                    }
                }
            });

            return interaction.followUp(`**${track.title}** enqueued!`);
        } catch (e) {
            console.error('Play Command Error:', e);
            return interaction.followUp(`Something went wrong: ${e.message} (Check console)`);
        }
    },
};
