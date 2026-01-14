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
    isPremium: { type: Boolean, default: false }
});

module.exports = mongoose.model('Guild', GuildSchema);
