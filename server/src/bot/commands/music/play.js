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
    async execute(interaction, client) {
        await interaction.deferReply();
        const query = interaction.options.getString('query');
        const channel = interaction.member.voice.channel;

        if (!channel) return interaction.followUp('❌ You need to be in a voice channel!');

        // Get Shoukaku instance from app request (or global client if attached)
        // In this architecture, we attached it to express req, but for bot commands we need it on 'client'
        // We need to ensure we attached shoukaku to client in index.js
        // If not, we can access it via the node module or ensure it's passed.
        // Assuming client.shoukaku is available (we need to attach it in index.js explicitly if not already)

        // Wait! In index.js I attached it to `req.shoukaku`. I should also attach it to `client.shoukaku`.
        // Let's assume I fix index.js to do `client.shoukaku = shoukaku;` 

        const node = client.shoukaku.getNode();
        if (!node) return interaction.followUp('❌ No music nodes available. Try again later.');

        try {
            // Search
            const result = await node.rest.resolve(query);
            if (!result || result.loadType === 'empty') return interaction.followUp('❌ No results found.');

            const track = result.data.track || result.data[0]; // Handle different result types
            const metadata = result.data.info || result.data[0].info;

            // Join Voice
            const player = await node.joinVoiceChannel({
                guildId: interaction.guildId,
                channelId: channel.id,
                shardId: 0 // Default shard
            });

            // Play
            await player.playTrack({ track: track });

            return interaction.followUp(`🎶 | Now playing **${metadata.title}**!`);
        } catch (e) {
            console.error(e);
            return interaction.followUp(`❌ Error: ${e.message}`);
        }
    },
};
