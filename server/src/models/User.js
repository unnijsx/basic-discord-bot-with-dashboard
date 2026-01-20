const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    discordId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    globalName: { type: String }, // Display Name
    discriminator: { type: String },
    avatar: { type: String },
    accessToken: { type: String },
    refreshToken: { type: String },
    guilds: [{ type: String }], // List of Guild IDs where user is admin
    isAdmin: { type: Boolean, default: false }, // Site Admin
    isPremium: { type: Boolean, default: false },
    afk: {
        isAfk: { type: Boolean, default: false },
        reason: { type: String, default: 'AFK' },
        timestamp: { type: Date, default: null }
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
