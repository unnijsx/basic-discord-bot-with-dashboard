const mongoose = require('mongoose');

const ScheduledMessageSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    channelId: { type: String, required: true },
    content: { type: String },
    embed: {
        title: String,
        description: String,
        color: String,
        image: String,
        footer: String
    },
    cronExpression: { type: String, required: true }, // e.g. "0 9 * * 1" (Every Monday at 9am)
    timezone: { type: String, default: 'UTC' },
    isEnabled: { type: Boolean, default: true },
    nextRun: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ScheduledMessage', ScheduledMessageSchema);
