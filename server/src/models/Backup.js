const mongoose = require('mongoose');

const BackupSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    guildId: { type: String, required: true },
    data: { type: Object, required: true },
    createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 7 } // Auto-delete after 7 days? Or keep permanent? Let's keep 7 days for now to save space.
});

module.exports = mongoose.model('Backup', BackupSchema);
