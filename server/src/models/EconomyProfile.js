const mongoose = require('mongoose');

const EconomyProfileSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true, index: true },
    wallet: { type: Number, default: 0 },
    bank: { type: Number, default: 0 },
    bankCapacity: { type: Number, default: 1000 },
    cooldowns: {
        daily: { type: Date, default: null },
        work: { type: Date, default: null },
        beg: { type: Date, default: null },
        rob: { type: Date, default: null }
    }
}, { timestamps: true });

module.exports = mongoose.model('EconomyProfile', EconomyProfileSchema);
