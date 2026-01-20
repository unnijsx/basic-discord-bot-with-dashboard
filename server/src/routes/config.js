const express = require('express');
const router = express.Router();

const SystemConfig = require('../models/SystemConfig');

router.get('/branding', async (req, res) => {
    try {
        let config = await SystemConfig.findById('GLOBAL');

        const defaults = {
            appName: 'Rheox',
            appLogo: '/rheox_logo.png',
            primaryColor: '#ffb7c5',
            secondaryColor: '#ff9eb5',
            backgroundType: 'sakura',
            backgroundValue: ''
        };

        if (!config) {
            return res.json(defaults);
        }

        // Merge defaults with stored config to handle missing fields in existing docs
        res.json({ ...defaults, ...(config.branding || {}) });
    } catch (err) {
        console.error('Branding fetch error:', err);
        // Fallback to defaults on error
        res.json({
            appName: 'Rheox',
            appLogo: '/rheox_logo.png',
            primaryColor: '#ffb7c5',
            secondaryColor: '#ff9eb5',
            backgroundType: 'sakura',
            backgroundValue: ''
        });
    }
});

module.exports = router;
