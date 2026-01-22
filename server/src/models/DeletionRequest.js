const mongoose = require('mongoose');

const DeletionRequestSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    requestedBy: { type: String, required: true }, // Discord ID of the user (Server Owner)
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    reason: { type: String },
    createdAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date }
});

module.exports = mongoose.model('DeletionRequest', DeletionRequestSchema);
