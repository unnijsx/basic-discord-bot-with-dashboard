const mongoose = require('mongoose');

const FormSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    triggerType: { type: String, enum: ['command', 'button'], default: 'button' },
    triggerLabel: { type: String, default: 'Open Form' }, // Button text or command name
    questions: [{
        id: { type: String, required: true }, // unique field id
        label: { type: String, required: true },
        type: { type: String, enum: ['short', 'paragraph', 'multiple_choice'], default: 'short' },
        required: { type: Boolean, default: true },
        options: [{ type: String }] // For multiple choice
    }],
    responseChannelId: { type: String, required: true }, // Where to send submissions
    isEnabled: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Form', FormSchema);
