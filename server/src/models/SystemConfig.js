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
    },

    // Global Branding & Theme
    branding: {
        appName: { type: String, default: 'Rheox' },
        appLogo: { type: String, default: '/rheox_logo.png' },
        primaryColor: { type: String, default: '#ffb7c5' }, // Default Sakura Pink
        secondaryColor: { type: String, default: '#ff9eb5' },
        backgroundType: { type: String, enum: ['video', 'image', 'gradient', 'sakura'], default: 'sakura' },
        backgroundValue: { type: String, default: '' } // URL for image/video or CSS value for gradient
    }
}, { timestamps: true });

module.exports = mongoose.model('SystemConfig', SystemConfigSchema);
