const router = require('express').Router();
const TicketPanel = require('../models/TicketPanel');
const Ticket = require('../models/Ticket');
const Guild = require('../models/Guild');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField } = require('discord.js');

// GET /api/tickets/:guildId/panels
router.get('/:guildId/panels', async (req, res) => {
    try {
        const panels = await TicketPanel.find({ guildId: req.params.guildId });
        res.json(panels);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/tickets/:guildId/panels
router.post('/:guildId/panels', async (req, res) => {
    try {
        const { title, description, buttonText, buttonEmoji, ticketCategory, closedCategory, transcriptChannelId, supportRole, namingScheme, uniqueId } = req.body;

        // If uniqueId exists, update, else create
        let panel;
        if (uniqueId) {
            panel = await TicketPanel.findOneAndUpdate(
                { uniqueId, guildId: req.params.guildId },
                { title, description, buttonText, buttonEmoji, ticketCategory, closedCategory, transcriptChannelId, supportRole, namingScheme },
                { new: true, upsert: true }
            );
        } else {
            panel = new TicketPanel({
                guildId: req.params.guildId,
                title, description, buttonText, buttonEmoji, ticketCategory, closedCategory, transcriptChannelId, supportRole, namingScheme
            });
            await panel.save();
        }
        res.json(panel);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/tickets/:guildId/panels/:panelId
router.delete('/:guildId/panels/:panelId', async (req, res) => {
    try {
        await TicketPanel.findOneAndDelete({ uniqueId: req.params.panelId, guildId: req.params.guildId });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/tickets/:guildId/deploy/:panelId
router.post('/:guildId/deploy/:panelId', async (req, res) => {
    try {
        const { channelId } = req.body;
        const panel = await TicketPanel.findOne({ uniqueId: req.params.panelId, guildId: req.params.guildId });
        if (!panel) return res.status(404).json({ error: 'Panel not found' });

        const channel = req.botClient.channels.cache.get(channelId);
        if (!channel) return res.status(404).json({ error: 'Channel not found' });

        const embed = new EmbedBuilder()
            .setTitle(panel.title)
            .setDescription(panel.description)
            .setColor('#3b82f6')
            .setFooter({ text: 'Powered by Rheox' });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`ticket_create_${panel.uniqueId}`)
                    .setLabel(panel.buttonText)
                    .setEmoji(panel.buttonEmoji || '🎫')
                    .setStyle(ButtonStyle.Primary)
            );

        await channel.send({ embeds: [embed], components: [row] });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/tickets/:guildId/active
router.get('/:guildId/active', async (req, res) => {
    try {
        const tickets = await Ticket.find({ guildId: req.params.guildId, status: 'open' }).sort({ createdAt: -1 });
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/tickets/:guildId/history
router.get('/:guildId/history', async (req, res) => {
    try {
        const history = await Ticket.find({ guildId: req.params.guildId, status: 'closed' })
            .sort({ closedAt: -1 })
            .select('channelId userId closedBy closedAt status claimedBy')
            .limit(50);
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/tickets/:guildId/transcript/:ticketId
router.get('/:guildId/transcript/:ticketId', async (req, res) => {
    try {
        const ticket = await Ticket.findOne({ _id: req.params.ticketId, guildId: req.params.guildId });
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
        res.json(ticket);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
