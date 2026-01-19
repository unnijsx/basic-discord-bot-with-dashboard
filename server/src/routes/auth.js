const router = require('express').Router();
const passport = require('passport');

// Login with Discord
router.get('/discord', passport.authenticate('discord', { scope: ['identify', 'email', 'guilds'] }));

// Redirect Handler
router.get('/discord/callback', (req, res, next) => {
    passport.authenticate('discord', {
        failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`
    }, (err, user, info) => {
        if (err) {
            console.error('Auth Callback Error:', err);
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_error`);
        }
        if (!user) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
        }
        req.logIn(user, (err) => {
            if (err) {
                console.error('Login Error:', err);
                return res.redirect(`${process.env.FRONTEND_URL}/login?error=login_error`);
            }
            res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
        });
    })(req, res, next);
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

        // Check if Bot is in these guilds
        const guildsWithBotStatus = adminGuilds.map(guild => {
            const botInGuild = req.botClient ? req.botClient.guilds.cache.has(guild.id) : false;
            return { ...guild, botInGuild };
        });

        res.json(guildsWithBotStatus);
    } catch (err) {
        console.error('Fetch Guilds Error:', err.message);
        if (err.response) {
            console.error('Discord API Status:', err.response.status);
            console.error('Discord API Data:', JSON.stringify(err.response.data));
        }

        if (err.response && err.response.status === 401) {
            req.logout((logoutErr) => {
                if (logoutErr) console.error('Logout Error:', logoutErr);
                return res.status(401).json({ message: 'Session expired, please login again.' });
            });
        } else {
            res.status(500).json({
                message: 'Failed to fetch guilds',
                error: err.message,
                details: err.response?.data
            });
        }
    }
});

module.exports = router;
