const router = require('express').Router();

// Helper to check if user can manage music
const checkAuth = (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    next();
};

// Get Player Status
router.get('/:guildId/status', checkAuth, (req, res) => {
    const shoukaku = req.shoukaku;
    if (!shoukaku) return res.status(503).json({ message: 'Music service unavailable' });

    // Find any node that has this player
    // Shoukaku manages players on specific nodes. We can iterate nodes or just getting from the best node if we don't know.
    // Verify Shoukaku player access
    let player = shoukaku.players.get(req.params.guildId);
    if (!player) {
        // Fallback debug
        console.log(`[DEBUG] Player not found in shoukaku.players for ${req.params.guildId}`);
    }

    if (!player) {
        return res.json({
            isPlaying: false,
            currentTrack: null,
            queue: [],
            volume: 100,
            connected: false
        });
    }

    // Shoukaku doesn't store track info on the player object directly in a 'currentTrack' prop that matches discord-player
    // We kept track metadata in our /play command? 
    // Actually Shoukaku 'track' event gives us the track string. 
    // To get metadata, we might need to decoded it or store it in `player.data` when we play.
    // For now, let's assume we can't easily get full metadata unless we stored it.
    // Wait, let's simply report basic connected status for now to prevent crash.
    // Ideally we store the current track info in player.data when starting.

    // Get Queue Data from Bot Memory
    const guildQueue = req.botClient.queue?.get(req.params.guildId);
    const currentTrack = guildQueue?.current?.info || null;
    const queue = guildQueue?.tracks?.map(t => ({
        title: t.info.title,
        author: t.info.author,
        duration: t.info.length,
        durationString: t.info.length ? new Date(t.info.length).toISOString().substr(14, 5) : 'Live',
        url: t.info.uri,
        thumbnail: t.info.artworkUrl || ''
    })) || [];

    res.json({
        isPlaying: !player.paused && !!currentTrack,
        volume: player.volume,
        connected: true,
        currentTrack: currentTrack ? {
            title: currentTrack.title,
            author: currentTrack.author,
            duration: currentTrack.length,
            durationString: currentTrack.length ? new Date(currentTrack.length).toISOString().substr(14, 5) : 'Live',
            position: player.position,
            thumbnail: currentTrack.artworkUrl || '',
            url: currentTrack.uri
        } : null,
        queue: queue,
        filters: player.filters,
        loop: !!guildQueue?.loop
    });
});

// Search Tracks
router.get('/:guildId/search', checkAuth, async (req, res) => {
    const shoukaku = req.shoukaku;
    const { query } = req.query;

    if (!query) return res.status(400).json({ message: 'Query required' });

    const node = shoukaku.options.nodeResolver(shoukaku.nodes);
    if (!node) return res.status(503).json({ message: 'No nodes available' });

    try {
        const isUrl = /^https?:\/\//.test(query);
        const searchNode = isUrl ? query : `ytsearch:${query}`;
        const result = await node.rest.resolve(searchNode);
        if (!result) return res.json([]);

        let tracks = [];
        if (['search', 'SEARCH_RESULT', 'track', 'TRACK_LOADED'].includes(result.loadType)) {
            tracks = Array.isArray(result.data) ? result.data : [result.data];
        } else if (['playlist', 'PLAYLIST_LOADED'].includes(result.loadType)) {
            tracks = result.data.tracks;
        }

        // Normalize
        const normalized = tracks.slice(0, 10).map(t => ({
            title: t.info.title,
            author: t.info.author,
            thumbnail: t.info.artworkUrl || '',
            duration: t.info.length,
            url: t.info.uri
        }));

        res.json(normalized);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Search failed' });
    }
});

// Control Player
router.post('/:guildId/control', checkAuth, async (req, res) => {
    const shoukaku = req.shoukaku;
    const { action, query, volume } = req.body;
    const guildId = req.params.guildId;

    let player = shoukaku.players.get(guildId);

    // Connect logic is complex via REST, play safer to fail if not connected
    if (!player && action !== 'play') {
        return res.status(404).json({ message: 'Bot is not connected to voice.' });
    }

    try {
        // For play action, we might not have a player yet, handled below
        const guildQueue = req.botClient.queue?.get(guildId);

        switch (action) {
            case 'play': {
                // Dashboard play request logic
                const member = await req.botClient.guilds.cache.get(guildId)?.members.fetch(req.user.discordId).catch(() => null);
                if (!member?.voice?.channelId) {
                    return res.status(400).json({ message: 'You must be in a voice channel to play music.' });
                }

                const userChannelId = member.voice.channelId;
                const existingPlayer = shoukaku.players.get(guildId);

                // Check if bot is already in a DIFFERENT voice channel
                if (existingPlayer && existingPlayer.connection.channelId !== userChannelId) {
                    return res.status(400).json({ message: 'Bot is already playing in another voice channel.' });
                }

                // Auto-join if not connected
                let player = existingPlayer;
                if (!player) {
                    try {
                        player = await shoukaku.joinVoiceChannel({
                            guildId: guildId,
                            channelId: userChannelId,
                            shardId: 0 // assuming single shard or handled by lib
                        });
                        // Initialize queue structure if new connection
                        if (!req.botClient.queue.has(guildId)) {
                            req.botClient.queue.set(guildId, {
                                tracks: [],
                                current: null,
                                loop: false
                            });
                        }
                    } catch (err) {
                        return res.status(500).json({ message: 'Failed to join voice channel.', error: err.message });
                    }
                }

                const node = shoukaku.options.nodeResolver(shoukaku.nodes);
                const isUrl = /^https?:\/\//.test(query);
                const searchNode = isUrl ? query : `ytsearch:${query}`;
                const result = await node.rest.resolve(searchNode);
                if (!result || ['empty', 'error', 'NONE'].includes(result.loadType)) {
                    return res.status(400).json({ message: 'No tracks found' });
                }

                let track;
                let metadata;
                if (['track', 'TRACK_LOADED'].includes(result.loadType)) {
                    track = result.data.encoded;
                    metadata = result.data.info;
                } else if (['search', 'SEARCH_RESULT'].includes(result.loadType)) {
                    track = result.data[0].encoded;
                    metadata = result.data[0].info;
                } else if (['playlist', 'PLAYLIST_LOADED'].includes(result.loadType)) {
                    track = result.data.tracks[0].encoded;
                    metadata = result.data.tracks[0].info;
                    // TODO: Add whole playlist support later if needed
                }

                const trackItem = { encoded: track, info: metadata, requester: { tag: 'Dashboard User', displayAvatarURL: () => '' } };

                const guildQueue = req.botClient.queue.get(guildId); // Refresh reference

                // If queue exists
                if (guildQueue) {
                    if (guildQueue.current) {
                        guildQueue.tracks.push(trackItem);
                    } else {
                        guildQueue.current = trackItem;
                        await player.playTrack({ track: { encoded: track } });
                    }
                    // Emit update
                    req.io.to(guildId).emit('queueUpdate');
                    req.io.to(guildId).emit('playerUpdate', { isPlaying: true, connected: true });
                }
                break;
            }
            case 'pause':
                player?.setPaused(true);
                req.io.to(guildId).emit('playerUpdate', { isPlaying: false });
                break;
            case 'resume':
                player?.setPaused(false);
                req.io.to(guildId).emit('playerUpdate', { isPlaying: true });
                break;
            case 'skip':
                player?.stopTrack();
                break;
            case 'seek':
                if (typeof req.body.position === 'number') {
                    await player.seekTo(req.body.position);
                    req.io.to(guildId).emit('playerUpdate', { isPlaying: !player.paused, position: req.body.position });
                }
                break;
            case 'stop':
                if (player) {
                    player.stopTrack();
                    shoukaku.leaveVoiceChannel(guildId);
                    if (guildQueue) {
                        guildQueue.tracks = [];
                        guildQueue.current = null;
                    }
                    req.io.to(guildId).emit('playerUpdate', { isPlaying: false, connected: false });
                }
                break;
            case 'volume':
                if (typeof volume === 'number') player?.setGlobalVolume(volume);
                break;
            case 'toggleLoop':
                if (guildQueue) {
                    guildQueue.loop = !guildQueue.loop;
                    req.io.to(guildId).emit('playerUpdate', { loop: guildQueue.loop });
                }
                break;
            case '8d':
                if (req.body.enabled) {
                    player?.setFilters({
                        rotation: { rotationHz: 0.2 }
                    });
                } else {
                    player?.clearFilters();
                }
                req.io.to(guildId).emit('playerUpdate', { filters: req.body.enabled ? { rotation: true } : {} });
                break;
            default:
                return res.status(400).json({ message: 'Invalid action' });
        }
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Action failed', error: error.message });
    }
});

module.exports = router;
