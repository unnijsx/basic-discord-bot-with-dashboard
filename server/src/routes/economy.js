const router = require('express').Router();
const EconomyProfile = require('../models/EconomyProfile');

// GET /api/economy/leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        // Fetch top 100 richest users
        // Sort by wallet + bank
        const profiles = await EconomyProfile.find({});

        // Sorting in JS because aggregation might be overkill for MVP, 
        // but aggregation is better. Let's use JS for simplicity if data is small,
        // or aggregation for performance.
        // Let's use aggregation to get top 50.

        const leaderboard = await EconomyProfile.aggregate([
            {
                $addFields: {
                    totalNetWorth: { $add: ["$wallet", "$bank"] }
                }
            },
            { $sort: { totalNetWorth: -1 } },
            { $limit: 50 },
            {
                $project: {
                    userId: "$discordId", // We will resolve usernames on frontend or here? 
                    // Ideally we resolve here, but that's slow. 
                    // Frontend can show ID or we can try to fetch from cache if possible.
                    // For now, send discordId.
                    wallet: 1,
                    bank: 1
                }
            }
        ]);

        res.json(leaderboard);
    } catch (err) {
        console.error('Leaderboard Fetch Error:', err);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// GET /api/economy/:userId (My Balance)
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const profile = await EconomyProfile.findOne({ discordId: userId });
        if (!profile) return res.status(404).json({ error: 'User not found' });
        res.json(profile);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
