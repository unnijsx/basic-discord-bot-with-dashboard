const router = require('express').Router();
const { useMainPlayer } = require('discord-player');

// Helper to check if user can manage music (simplified to basic auth for now)
const checkAuth = (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    // In production, check if user is in the guild and has permissions
    next();
};

// Get Player Status
router.get('/:guildId/status', checkAuth, (req, res) => {
    const player = useMainPlayer();
    const queue = player.nodes.get(req.params.guildId);

    if (!queue) {
        return res.json({
            isPlaying: false,
            currentTrack: null,
            queue: [],
            volume: 0,
            connected: false
        });
    }

    res.json({
        isPlaying: queue.isPlaying(),
        volume: queue.node.volume,
        connected: true,
        currentTrack: queue.currentTrack ? {
            title: queue.currentTrack.title,
            author: queue.currentTrack.author,
            thumbnail: queue.currentTrack.thumbnail,
            duration: queue.currentTrack.duration,
            url: queue.currentTrack.url
        } : null,
        queue: queue.tracks.toArray().slice(0, 20).map(t => ({
            title: t.title,
            author: t.author,
            duration: t.duration,
            thumbnail: t.thumbnail,
            url: t.url // useful for linking
        }))
    });
});

// Search Tracks
router.get('/:guildId/search', checkAuth, async (req, res) => {
    const player = useMainPlayer();
    const { query } = req.query;

    if (!query) return res.status(400).json({ message: 'Query required' });

    try {
        // Search Engine: Auto (detects Spotify/YouTube links automatically)
        const result = await player.search(query, {
            requestedBy: req.user
        });

        res.json(result.tracks.slice(0, 10).map(t => ({
            title: t.title,
            author: t.author,
            thumbnail: t.thumbnail,
            duration: t.duration,
            url: t.url
        })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Search failed' });
    }
});

// Control Player
router.post('/:guildId/control', checkAuth, async (req, res) => {
    const player = useMainPlayer();
    const queue = player.nodes.get(req.params.guildId);
    const { action, query, volume } = req.body;

    // Allow 'play' to create a queue if one doesn't exist, ONLY if we know the channel.
    // But via dashboard, we generally rely on an existing connection.
    if (!queue && action !== 'play') {
        return res.status(404).json({ message: 'Bot is not connected to voice.' });
    }

    try {
        switch (action) {
            case 'pause': queue.node.pause(); break;
            case 'resume': queue.node.resume(); break;
            case 'skip': queue.node.skip(); break;
            case 'stop': queue.delete(); break;
            case 'volume':
                if (typeof volume === 'number') queue.node.setVolume(volume);
                break;
            case 'play':
                if (!queue) return res.status(400).json({ message: 'Bot must be in a voice channel first (use /play in Discord)' });

                await player.play(queue.channel, query, {
                    nodeOptions: {
                        metadata: {
                            channel: queue.metadata.channel,
                            client: queue.metadata.client,
                            requestedBy: req.user
                        }
                    }
                });
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
