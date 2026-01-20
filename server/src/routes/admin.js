const router = require('express').Router();
const SystemConfig = require('../models/SystemConfig');
const Guild = require('../models/Guild');

// Middleware to check if user is Super Admin
const requireSuperAdmin = (req, res, next) => {
    const superAdmins = (process.env.SUPER_ADMIN_IDS || '').split(',').map(id => id.trim());
    // Use discordId from the user model, not the mongo _id
    if (req.user && superAdmins.includes(req.user.discordId)) {
        return next();
    }
    return res.status(403).json({ message: 'Forbidden: Super Admins only' });
};

router.use(requireSuperAdmin);

// GET System Config
router.get('/system-config', async (req, res) => {
    try {
        let config = await SystemConfig.findById('GLOBAL');
        if (!config) {
            config = new SystemConfig({ _id: 'GLOBAL' });
            await config.save();
        }
        res.json(config);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE System Config (Toggle Maintenance)
router.put('/system-config', async (req, res) => {
    try {
        const config = await SystemConfig.findByIdAndUpdate(
            'GLOBAL',
            { $set: req.body },
            { new: true, upsert: true }
        );

        // Apply Status Real-time
        if (req.body.botStatus && req.botClient) {
            const { status, activityType, activityText } = req.body.botStatus;
            const { ActivityType } = require('discord.js');
            const typeMap = {
                'Playing': ActivityType.Playing,
                'Watching': ActivityType.Watching,
                'Listening': ActivityType.Listening,
                'Competing': ActivityType.Competing
            };

            req.botClient.user.setPresence({
                status: status,
                activities: [{
                    name: activityText,
                    type: typeMap[activityType] || ActivityType.Playing
                }]
            });
        }

        res.json(config);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET Global Stats
router.get('/stats', async (req, res) => {
    try {
        const client = req.botClient;

        // Real-time stats from Bot Client
        const guildCount = client ? client.guilds.cache.size : 0;
        const users = client ? client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0) : 0;
        const ping = client ? Math.round(client.ws.ping) : -1;
        const uptime = client ? client.uptime : 0;

        // Get list of servers
        const serverList = client ? client.guilds.cache.map(g => ({
            id: g.id,
            name: g.name,
            icon: g.icon,
            memberCount: g.memberCount,
            joinedAt: g.joinedAt,
            ownerId: g.ownerId
        })) : [];

        res.json({
            guildCount,
            users,
            ping,
            uptime,
            servers: serverList
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// BROADCAST To All Guilds (Danger Zone)
router.post('/broadcast', async (req, res) => {
    const { message, type } = req.body;
    // Implementation: could iterate all guilds and send to log channel?
    // For now, we update the currentAlert in SystemConfig
    try {
        const config = await SystemConfig.findByIdAndUpdate(
            'GLOBAL',
            {
                currentAlert: {
                    message,
                    active: true,
                    type: type || 'info'
                }
            },
            { new: true }
        );

        // Optional: Emit via socket.io to connected dashboards
        req.io.emit('systemAlert', config.currentAlert);

        res.json({ success: true, alert: config.currentAlert });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CLEAR Broadcast
router.delete('/broadcast', async (req, res) => {
    try {
        const config = await SystemConfig.findByIdAndUpdate(
            'GLOBAL',
            {
                'currentAlert.active': false
            },
            { new: true }
        );

        // Optional: Emit via socket.io
        if (req.io) req.io.emit('systemAlert', { active: false });

        res.json({ success: true, alert: config.currentAlert });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
