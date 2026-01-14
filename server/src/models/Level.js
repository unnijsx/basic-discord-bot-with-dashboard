const mongoose = require('mongoose');

const LevelSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 0 },
    lastXp: { type: Date, default: Date.now }
});

// Composite index to ensure unique user per guild
LevelSchema.index({ userId: 1, guildId: 1 }, { unique: true });

module.exports = mongoose.model('Level', LevelSchema);
