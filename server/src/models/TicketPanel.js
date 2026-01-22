const mongoose = require('mongoose');
const crypto = require('crypto');

const TicketPanelSchema = new mongoose.Schema({
    guildId: { type: String, required: true, index: true },
    uniqueId: { type: String, default: () => crypto.randomUUID(), unique: true }, // Unique ID for specific panel
    title: { type: String, default: 'Open a Ticket' },
    description: { type: String, default: 'Click the button below to react out to our support team.' },
    buttonText: { type: String, default: 'Create Ticket' },
    buttonEmoji: { type: String, default: '🎫' },
    ticketCategory: { type: String }, // Open Ticket Category ID
    closedCategory: { type: String }, // Scrapped/Archived Ticket Category ID
    transcriptChannelId: { type: String }, // Channel to send transcripts to
    supportRole: { type: String }, // Role ID to ping/add to ticket
    namingScheme: { type: String, default: 'ticket-{username}' }, // 'ticket-{username}' or 'ticket-{id}'
    formQuestions: [{
        label: String, // Question Text
        placeholder: String,
        style: { type: String, enum: ['Short', 'Paragraph'], default: 'Paragraph' },
        required: { type: Boolean, default: true },
        maxLength: Number
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TicketPanel', TicketPanelSchema);
