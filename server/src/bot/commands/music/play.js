const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays a song or playlist.')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('The song URL or name')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();
        const client = interaction.client;
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

        // Shoukaku v4: getNode() is gone, use nodeResolver
        const node = client.shoukaku.options.nodeResolver(client.shoukaku.nodes);
        if (!node) return interaction.followUp('❌ No music nodes available. Try again later.');

        try {
            // Auto-detect URL or Search
            const isUrl = /^https?:\/\//.test(query);
            const searchNode = isUrl ? query : `ytsearch:${query}`;

            // Search
            const result = await node.rest.resolve(searchNode);

            if (!result || result.loadType === 'empty' || result.loadType === 'error' || result.loadType === 'NONE') {
                return interaction.followUp('❌ No results found. Try a different search term.');
            }

            let track;
            let metadata;

            switch (result.loadType) {
                case 'track':
                case 'TRACK_LOADED':
                    track = result.data.encoded;
                    metadata = result.data.info;
                    break;
                case 'search':
                case 'SEARCH_RESULT':
                    if (!Array.isArray(result.data) || result.data.length === 0) return interaction.followUp('❌ No matches found.');
                    track = result.data[0].encoded;
                    metadata = result.data[0].info;
                    break;
                case 'playlist':
                case 'PLAYLIST_LOADED':
                    if (!result.data.tracks || result.data.tracks.length === 0) return interaction.followUp('❌ Empty playlist.');
                    track = result.data.tracks[0].encoded;
                    metadata = result.data.tracks[0].info;
                    break;
                default:
                    return interaction.followUp(`❌ Unexpected result type: ${result.loadType}`);
            }

            // --- Queue System ---
            if (!client.queue) client.queue = new Map();
            let guildQueue = client.queue.get(interaction.guild.id);

            if (!guildQueue) {
                guildQueue = {
                    tracks: [],
                    player: null,
                    current: null
                };
                client.queue.set(interaction.guild.id, guildQueue);
            }



            // Join Voice
            // check if player exists using client.shoukaku.players
            let player = client.shoukaku.players.get(interaction.guild.id);
            if (!player) {
                player = await client.shoukaku.joinVoiceChannel({
                    guildId: interaction.guild.id,
                    channelId: channel.id,
                    shardId: 0
                });
                guildQueue.player = player;

                // Event Listeners for Queue
                player.on('end', async () => {
                    const nextTrack = guildQueue.tracks.shift();
                    if (nextTrack) {
                        guildQueue.current = nextTrack;
                        const wasPaused = player.paused;
                        await player.playTrack({ track: { encoded: nextTrack.encoded } });
                        if (wasPaused) await player.setPaused(true);
                    } else {
                        guildQueue.current = null;
                    }
                });
            }

            // Add to Queue
            const trackItem = { encoded: track, info: metadata, requester: interaction.user };

            if (guildQueue.current) {
                // Add to queue
                guildQueue.tracks.push(trackItem);
                const queueEmbed = new EmbedBuilder()
                    .setColor('#00b0f4')
                    .setTitle('📜 Added to Queue')
                    .setDescription(`[${metadata.title}](${metadata.uri})`)
                    .setFooter({ text: `Position: ${guildQueue.tracks.length}` });
                return interaction.editReply({ content: null, embeds: [queueEmbed] });
            } else {
                // Play Immediately
                guildQueue.current = trackItem;
                await player.playTrack({ track: { encoded: track } });
            }

            // --- Buttons & Embed ---
            const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

            const playPauseBtn = new ButtonBuilder().setCustomId('music_pause').setEmoji('⏯️').setStyle(ButtonStyle.Secondary);
            const skipBtn = new ButtonBuilder().setCustomId('music_skip').setEmoji('⏭️').setStyle(ButtonStyle.Secondary);
            const stopBtn = new ButtonBuilder().setCustomId('music_stop').setEmoji('⏹️').setStyle(ButtonStyle.Danger);
            const row = new ActionRowBuilder().addComponents(playPauseBtn, skipBtn, stopBtn);

            const playEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🎶 Now Playing')
                .setDescription(`[${metadata.title}](${metadata.uri})`)
                .setThumbnail(metadata.artworkUrl || 'https://i.imgur.com/AfFp7pu.png')
                .addFields(
                    { name: 'Author', value: metadata.author || 'Unknown', inline: true },
                    { name: 'Duration', value: metadata.length ? `${Math.floor(metadata.length / 60000)}:${((metadata.length % 60000) / 1000).toFixed(0).padStart(2, '0')}` : 'Live', inline: true }
                )
                .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

            return interaction.editReply({ content: null, embeds: [playEmbed], components: [row] });

        } catch (e) {
            console.error('[Play Error Full]:', e); // Log full error object
            const errorMessage = e.message || e.error || 'Check console for details';
            return interaction.editReply({ content: `❌ Playback failed: ${errorMessage}`, embeds: [] });
        }
    },
};
