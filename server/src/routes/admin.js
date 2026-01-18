const router = require('express').Router();
const SystemConfig = require('../models/SystemConfig');
const Guild = require('../models/Guild');

// Middleware to check if user is Super Admin
const requireSuperAdmin = (req, res, next) => {
    const superAdmins = (process.env.SUPER_ADMIN_IDS || '').split(',');
    if (req.user && superAdmins.includes(req.user.id)) {
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
        res.json(config);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET Global Stats
router.get('/stats', async (req, res) => {
    try {
        const guildCount = await Guild.countDocuments();
        const maintenanceGuilds = await Guild.countDocuments({ maintenanceMode: true });

        // Use bot client to get real-time stats (if available in req)
        const client = req.botClient;
        const ping = client ? client.ws.ping : -1;
        const uptime = client ? client.uptime : 0;
        const users = client ? client.users.cache.size : 0;

        res.json({
            guildCount,
            maintenanceGuilds,
            ping,
            uptime,
            users
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

module.exports = router;
