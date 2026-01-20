const mongoose = require('mongoose');

const SuggestionSchema = new mongoose.Schema({
    guildId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    suggestion: { type: String, required: true },
    messageId: { type: String }, // Discord message ID of the embed
    channelId: { type: String },
    status: { type: String, enum: ['Pending', 'Approved', 'Denied', 'Implemented'], default: 'Pending' },
    upvotes: [{ type: String }], // Array of user IDs
    downvotes: [{ type: String }],
    adminComment: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Suggestion', SuggestionSchema);
