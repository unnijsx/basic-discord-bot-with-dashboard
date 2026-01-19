const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
    guildId: { type: String, required: true, index: true },
    channelId: { type: String, required: true, unique: true },
    userId: { type: String, required: true }, // The creator
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    closedBy: { type: String },
    closedAt: { type: Date },
    transcript: { type: String }, // URL or stored path (optional)
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ticket', TicketSchema);
