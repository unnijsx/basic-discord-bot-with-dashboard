const router = require('express').Router();
const Form = require('../models/Form');
const ScheduledMessage = require('../models/ScheduledMessage');

// =======================
// FORMS
// =======================

// Get Forms for Guild
router.get('/:guildId/forms', async (req, res) => {
    try {
        const forms = await Form.find({ guildId: req.params.guildId });
        res.json(forms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create Form
router.post('/:guildId/forms', async (req, res) => {
    try {
        const { title, questions, responseChannelId, triggerLabel } = req.body;
        const newForm = new Form({
            guildId: req.params.guildId,
            title,
            questions,
            responseChannelId,
            triggerLabel
        });
        await newForm.save();
        res.json(newForm);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Form
router.delete('/:guildId/forms/:formId', async (req, res) => {
    try {
        await Form.findOneAndDelete({ _id: req.params.formId, guildId: req.params.guildId });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =======================
// SCHEDULED MESSAGES
// =======================

// Get Scheduled Messages
router.get('/:guildId/scheduled-messages', async (req, res) => {
    try {
        const msgs = await ScheduledMessage.find({ guildId: req.params.guildId });
        res.json(msgs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Scheduled Message
router.delete('/:guildId/scheduled-messages/:msgId', async (req, res) => {
    try {
        const msg = await ScheduledMessage.findOneAndDelete({ _id: req.params.msgId, guildId: req.params.guildId });
        if (msg) {
            scheduler.unschedule(msg._id.toString());
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const scheduler = require('../utils/scheduler');

// Create Scheduled Message
router.post('/:guildId/scheduled-messages', async (req, res) => {
    try {
        const { channelId, content, cronExpression, timezone } = req.body;
        const newMsg = new ScheduledMessage({
            guildId: req.params.guildId,
            channelId,
            content,
            cronExpression,
            timezone
        });
        await newMsg.save();

        // Schedule it immediately
        scheduler.schedule(newMsg);

        res.json(newMsg);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
