const mongoose = require('mongoose');

const SystemConfigSchema = new mongoose.Schema({
    // Singleton ID (always 'GLOBAL')
    _id: { type: String, default: 'GLOBAL' },

    // Maintenance Mode
    maintenanceMode: { type: Boolean, default: false },
    maintenanceReason: { type: String, default: 'System is undergoing scheduled maintenance. We will be back shortly.' },

    // Whitelists for Maintenance Mode
    allowedGuilds: [{ type: String }], // Guild IDs allowed during maintenance
    allowedUsers: [{ type: String }],  // User IDs allowed during maintenance

    // Super Admins (Can bypass everything)
    superAdmins: [{ type: String }],

    // Global Feature Flags (Kill switches)
    globalFeatureFlags: {
        music: { type: Boolean, default: true },
        leveling: { type: Boolean, default: true },
        moderation: { type: Boolean, default: true },
        economy: { type: Boolean, default: true }
    },

    // Module Tiers (Free vs Premium)
    moduleTiers: {
        music: { type: String, enum: ['free', 'premium'], default: 'premium' },
        embedBuilder: { type: String, enum: ['free', 'premium'], default: 'premium' },
        forms: { type: String, enum: ['free', 'premium'], default: 'premium' },
        tickets: { type: String, enum: ['free', 'premium'], default: 'free' },
        moderation: { type: String, enum: ['free', 'premium'], default: 'free' },
        leveling: { type: String, enum: ['free', 'premium'], default: 'free' },
        logging: { type: String, enum: ['free', 'premium'], default: 'free' },
        analytics: { type: String, enum: ['free', 'premium'], default: 'free' }
    },

    // System Alerts (Broadcasts)
    currentAlert: {
        message: { type: String },
        active: { type: Boolean, default: false },
        type: { type: String, enum: ['info', 'warning', 'error'], default: 'info' }
    },

    // Bot Identity
    botStatus: {
        status: { type: String, enum: ['online', 'idle', 'dnd', 'invisible'], default: 'online' },
        activityType: { type: String, enum: ['Playing', 'Watching', 'Listening', 'Competing'], default: 'Playing' },
        activityText: { type: String, default: 'Discord' }
    }
}, { timestamps: true });

module.exports = mongoose.model('SystemConfig', SystemConfigSchema);
