const mongoose = require('mongoose');

const GuildSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    ownerId: { type: String, required: true },
    prefix: { type: String, default: '!' },
    language: { type: String, default: 'en' },
    modules: {
        moderation: { type: Boolean, default: false },
        leveling: { type: Boolean, default: false },
        music: { type: Boolean, default: false },
        logging: { type: Boolean, default: false }
    },
    // Module specific settings
    moderationConfig: {
        autoMod: { type: Boolean, default: false },
        logChannelId: { type: String }
    },
    levelingConfig: {
        levelUpMessage: { type: String, default: 'Congratulations {user}, you reached level {level}!' },
        levelUpChannelId: { type: String } // null = current channel
    },
    // Logging Settings
    loggingConfig: {
        logChannelId: { type: String },
        logMessageDelete: { type: Boolean, default: true },
        logMessageEdit: { type: Boolean, default: true },
        logMemberJoin: { type: Boolean, default: true },
        logMemberLeave: { type: Boolean, default: true }
    },
    // Welcome Module
    welcomeConfig: {
        enabled: { type: Boolean, default: false },
        channelId: { type: String },
        message: { type: String, default: 'Welcome {user} to {server}!' },
        autoRoleId: { type: String }
    },
    // Store active subscriptions or premium status
    isPremium: { type: Boolean, default: false },

    // Guild-Specific Maintenance & Features
    maintenanceMode: { type: Boolean, default: false },
    maintenanceReason: { type: String, default: 'This server is currently in maintenance mode.' },

    // Granular Feature Flags (Local Kill Switches)
    features: {
        moderation: { type: Boolean, default: true },
        leveling: { type: Boolean, default: true },
        music: { type: Boolean, default: true },
        logging: { type: Boolean, default: true },
        welcome: { type: Boolean, default: true }
    },

    // Onboarding Status
    configured: { type: Boolean, default: false },

    // Data Retention Policies (GDPR/Safety)
    dataRetention: {
        logsDays: { type: Number, default: 30 }, // Auto-purge after 30 days
        analyticsDays: { type: Number, default: 90 }
    }
});

module.exports = mongoose.model('Guild', GuildSchema);
