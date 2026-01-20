const mongoose = require('mongoose');

const TempActionSchema = new mongoose.Schema({
    guildId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    type: { type: String, enum: ['mute', 'ban'], required: true },
    expiresAt: { type: Date, required: true },
    active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('TempAction', TempActionSchema);
