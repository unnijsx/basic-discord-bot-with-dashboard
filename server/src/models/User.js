const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    discordId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    discriminator: { type: String },
    avatar: { type: String },
    accessToken: { type: String },
    refreshToken: { type: String },
    guilds: [{ type: String }], // List of Guild IDs where user is admin
    isPremium: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
