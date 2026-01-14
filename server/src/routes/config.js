const express = require('express');
const router = express.Router();

router.get('/branding', (req, res) => {
    res.json({
        appName: process.env.APP_NAME || 'CloneBot Platform',
        appLogo: process.env.APP_LOGO || '',
        themeColor: process.env.THEME_COLOR || '#5865F2'
    });
});

module.exports = router;
