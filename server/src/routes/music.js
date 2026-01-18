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
    // However, players are usually stored in a map on the node.
    // A simpler way with Shoukaku wrapper might be needed, but raw access:
    let player = null;
    for (const node of shoukaku.nodes.values()) {
        if (node.players.has(req.params.guildId)) {
            player = node.players.get(req.params.guildId);
            break;
        }
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

    res.json({
        isPlaying: !player.paused,
        volume: player.volume,
        connected: true,
        currentTrack: null, // TODO: Store track metadata in player custom data
        queue: []
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
        const result = await node.rest.resolve(query);
        if (!result) return res.json([]);

        let tracks = [];
        if (result.loadType === 'search' || result.loadType === 'track') {
            tracks = [result.data]; // data is track info
            if (Array.isArray(result.data)) tracks = result.data;
        } else if (result.loadType === 'playlist') {
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

    let player = null;
    for (const node of shoukaku.nodes.values()) {
        if (node.players.has(guildId)) {
            player = node.players.get(guildId);
            break;
        }
    }

    // Connect logic is complex via REST, play safer to fail if not connected
    if (!player && action !== 'play') {
        return res.status(404).json({ message: 'Bot is not connected to voice.' });
    }

    try {
        switch (action) {
            case 'pause': player?.setPaused(true); break;
            case 'resume': player?.setPaused(false); break;
            case 'skip': player?.stopTrack(); break; // Stop current track triggers next if queue (no queue yet)
            case 'stop':
                if (player) {
                    player.stopTrack();
                    // Leave channel?
                    // player.connection.disconnect(); // This might be needed
                    // Typically usage: shoukaku.leaveVoiceChannel(guildId);
                    shoukaku.leaveVoiceChannel(guildId);
                }
                break;
            case 'volume':
                if (typeof volume === 'number') player?.setGlobalVolume(volume);
                break;
            default:
                return res.status(400).json({ message: 'Invalid action / Play via Dashboard not supported yet (Use Discord)' });
        }
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Action failed', error: error.message });
    }
});

module.exports = router;
