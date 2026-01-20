const express = require('express');
const router = express.Router();

const SystemConfig = require('../models/SystemConfig');

router.get('/branding', async (req, res) => {
    try {
        let config = await SystemConfig.findById('GLOBAL');
        if (!config) {
            // Return defaults if no config exists yet
            return res.json({
                appName: 'Rheox',
                appLogo: '/rheox_logo.png',
                themeColor: '#ffb7c5',
                backgroundType: 'sakura'
            });
        }
        res.json(config.branding || {});
    } catch (err) {
        console.error('Branding fetch error:', err);
        // Fallback to defaults on error
        res.json({
            appName: 'Rheox',
            appLogo: '/rheox_logo.png',
            themeColor: '#ffb7c5'
        });
    }
});

module.exports = router;
