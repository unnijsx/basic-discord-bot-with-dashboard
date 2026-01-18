const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    messagesSent: { type: Number, default: 0 },
    membersJoined: { type: Number, default: 0 },
    membersLeft: { type: Number, default: 0 },
    activeUsers: { type: Number, default: 0 } // Unique talkers
});

// Compound index for fast lookup
AnalyticsSchema.index({ guildId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Analytics', AnalyticsSchema);
