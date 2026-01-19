```javascript
const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
    guildId: { type: String, required: true, index: true },
    channelId: { type: String, required: true, unique: true },
    userId: { type: String, required: true }, // The creator
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    claimedBy: { type: String, default: null }, // User ID of support staff
    closedBy: { type: String },
    closedAt: { type: Date },
    transcript: { type: String }, // URL or stored path (optional)
    messages: [{ // For Web Dashboard Transcript
        authorId: String,
        authorName: String,
        authorAvatar: String,
        content: String,
        attachments: [String],
        timestamp: Date
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ticket', TicketSchema);
```
