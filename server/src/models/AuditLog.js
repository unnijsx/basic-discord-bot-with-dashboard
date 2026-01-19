const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    guildId: { type: String, required: true, index: true },
    action: { type: String, required: true }, // e.g., CHANNEL_CREATE, MEMBER_BAN
    executorId: { type: String, required: true },
    executorName: { type: String },
    targetId: { type: String },
    targetName: { type: String },
    reason: { type: String },
    changes: { type: mongoose.Schema.Types.Mixed }, // flexible object for before/after
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);