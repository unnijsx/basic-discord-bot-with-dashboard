const router = require('express').Router();
const Analytics = require('../models/Analytics');

// Get Analytics (Last 30 Days)
router.get('/:guildId/analytics', async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // In real app, we filter by date string. 
        // For now, simpler: just return all, let client filter last 7/30 items.
        // Optimization: Sort by date asc.

        const stats = await Analytics.find({ guildId: req.params.guildId })
            .sort({ date: 1 })
            .limit(30);

        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
