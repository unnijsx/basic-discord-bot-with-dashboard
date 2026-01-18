const router = require('express').Router();
const passport = require('passport');

// Login with Discord
router.get('/discord', passport.authenticate('discord'));

// Redirect Handler
router.get('/discord/callback', passport.authenticate('discord', {
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`
}), (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
});

// Logout
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).send(err);
        res.redirect(process.env.FRONTEND_URL);
    });
});

// Get Current User
router.get('/me', (req, res) => {
    if (req.user) {
        const superAdmins = (process.env.SUPER_ADMIN_IDS || '').split(',');
        const isSuperAdmin = superAdmins.includes(req.user.id);
        res.json({ ...req.user, isSuperAdmin });
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
});

const axios = require('axios');
// Get User Guilds
router.get('/guilds', async (req, res) => {
    if (!req.user || !req.user.accessToken) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const response = await axios.get('https://discord.com/api/users/@me/guilds', {
            headers: {
                Authorization: `Bearer ${req.user.accessToken}`
            }
        });
        // Filter guilds where user has MANAGE_GUILD (0x20) permission
        const adminGuilds = response.data.filter(guild => (guild.permissions & 0x20) === 0x20);
        res.json(adminGuilds);
    } catch (err) {
        console.error('Fetch Guilds Error:', err.response?.data || err.message);
        res.status(500).json({ message: 'Failed to fetch guilds', error: err.message });
    }
});

module.exports = router;
