const router = require('express').Router();
const Guild = require('../models/Guild');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Level = require('../models/Level');
const { logAction } = require('../utils/auditLogger');
const AuditLog = require('../models/AuditLog');
const TicketPanel = require('../models/TicketPanel');

// Get Guild Basic Info
router.get('/guilds/:guildId', async (req, res) => {
    try {
        let settings = await Guild.findOne({ guildId: req.params.guildId }).lean();
        if (!settings) {
            settings = new Guild({
                guildId: req.params.guildId,
                name: 'Unknown',
                ownerId: 'Unknown'
            });
            await settings.save();
        }

        // Fetch Live Data
        const guild = req.botClient.guilds.cache.get(req.params.guildId);
        if (guild) {
            settings.memberCount = guild.memberCount;
            settings.channelCount = guild.channels.cache.size;
            settings.roleCount = guild.roles.cache.size;
            settings.icon = guild.iconURL({ dynamic: true });
            settings.name = guild.name; // accurate name
        }

        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Guild Settings
router.get('/guilds/:guildId/settings', async (req, res) => {
    try {
        const settings = await Guild.findOne({ guildId: req.params.guildId });
        if (!settings) {
            const newSettings = new Guild({
                guildId: req.params.guildId,
                name: 'Unknown',
                ownerId: 'Unknown'
            });
            await newSettings.save();
            return res.json(newSettings);
        }
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Guild Settings
router.put('/guilds/:guildId/settings', async (req, res) => {
    try {
        const { modules, moderationConfig, levelingConfig, loggingConfig } = req.body;

        const updateData = {};
        if (modules) updateData.modules = modules;
        if (moderationConfig) {
            // Deep merge or simple replace? Simple replace of sub-objects is safer for now if frontend sends full object.
            // But to be safe, we assign specific fields if provided.
            updateData.moderationConfig = { ...moderationConfig };
        }
        if (levelingConfig) updateData.levelingConfig = levelingConfig;
        if (loggingConfig) updateData.loggingConfig = loggingConfig;
        if (req.body.welcomeConfig) updateData.welcomeConfig = req.body.welcomeConfig;

        const settings = await Guild.findOneAndUpdate(
            { guildId: req.params.guildId },
            { $set: updateData },
            { new: true, upsert: true }
        );

        // Audit Log
        if (req.user) {
            await logAction(req.params.guildId, 'UPDATE_SETTINGS', req.user, updateData);
        }

        res.json(settings);
    } catch (err) {
        console.error('Settings Update Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Save Onboarding Config
router.put('/guilds/:guildId/onboarding', async (req, res) => {
    try {
        const { modules, preset } = req.body;

        // Apply presets and mark as configured
        const updateData = {
            configured: true,
            modules: modules,
            // You could store the preset name purely for analytics if desired
            // preset: preset 
        };

        const settings = await Guild.findOneAndUpdate(
            { guildId: req.params.guildId },
            { $set: updateData },
            { new: true, upsert: true }
        );
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Leaderboard
router.get('/guilds/:guildId/leaderboard', async (req, res) => {
    try {
        const levels = await Level.find({ guildId: req.params.guildId })
            .sort({ xp: -1 })
            .limit(100);

        let guild = req.botClient.guilds.cache.get(req.params.guildId);
        if (!guild) {
            try {
                guild = await req.botClient.guilds.fetch(req.params.guildId);
            } catch (e) {
                console.log('Leaderboard: Guild not found, proceeding with raw user fetch');
                guild = null;
            }
        }

        const enrichedLevels = await Promise.all(levels.map(async (entry) => {
            try {
                // Try fetching member from guild to get nickname/avatar
                let user;
                if (guild) {
                    try {
                        const member = await guild.members.fetch(entry.userId);
                        user = member.user;
                    } catch (e) {
                        // Member might have left, try fetching global user
                        user = await req.botClient.users.fetch(entry.userId);
                    }
                } else {
                    user = await req.botClient.users.fetch(entry.userId);
                }

                return {
                    ...entry.toObject(),
                    username: user.username,
                    discriminator: user.discriminator,
                    avatarURL: user.displayAvatarURL()
                };
            } catch (err) {
                // User might be deleted or bot can't find them, return fallback
                return {
                    ...entry.toObject(),
                    username: 'Unknown User',
                    avatarURL: null
                };
            }
        }));

        res.json(enrichedLevels);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Channels (Text Only)
router.get('/guilds/:guildId/channels', async (req, res) => {
    try {
        const guild = req.botClient.guilds.cache.get(req.params.guildId);
        if (!guild) return res.status(404).json({ message: 'Guild not found' });

        const channels = guild.channels.cache
            .filter(c => c.type === 0) // 0 = GuildText
            .map(c => ({ id: c.id, name: c.name }));

        res.json(channels);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Send Message / Embed
router.post('/guilds/:guildId/messages', async (req, res) => {
    try {
        const { channelId, content, embed } = req.body;
        const guild = req.botClient.guilds.cache.get(req.params.guildId);
        if (!guild) return res.status(404).json({ message: 'Guild not found' });

        const channel = guild.channels.cache.get(channelId);
        if (!channel) return res.status(404).json({ message: 'Channel not found' });

        const payload = {};
        if (content) payload.content = content;
        if (embed && Object.keys(embed).length > 0) {
            const embedObj = new EmbedBuilder();
            // Ensure strings are passed to setTitle/setDescription
            if (embed.title) embedObj.setTitle(String(embed.title));
            if (embed.description) embedObj.setDescription(String(embed.description));
            if (embed.color) embedObj.setColor(embed.color);
            if (embed.image) embedObj.setImage(embed.image);
            if (embed.thumbnail) embedObj.setThumbnail(embed.thumbnail);
            if (embed.footer) embedObj.setFooter({ text: String(embed.footer) });

            // Validate: Don't send empty embeds
            const hasContent = embed.title || embed.description || embed.image || embed.thumbnail || embed.footer;
            if (hasContent) {
                payload.embeds = [embedObj];
            }
        }

        // Support raw components payload (e.g. ActionRow with Buttons)
        if (req.body.components) {
            // We assume the client sends valid JSON structure for components
            payload.components = req.body.components;
        }

        await channel.send(payload);

        // Audit Log
        if (req.user) {
            await logAction(req.params.guildId, 'SEND_MESSAGE', req.user, {
                channelId,
                channelName: channel.name,
                hasContent: !!content,
                hasEmbed: !!embed,
                hasComponents: !!req.body.components
            });
        }

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Get Roles
router.get('/guilds/:guildId/roles', async (req, res) => {
    try {
        let guild = req.botClient.guilds.cache.get(req.params.guildId);
        if (!guild) {
            try {
                guild = await req.botClient.guilds.fetch(req.params.guildId);
            } catch (e) {
                return res.status(404).json({ message: 'Guild not found' });
            }
        }

        // Force fetch roles to ensure cache is populated
        await guild.roles.fetch();

        const roles = guild.roles.cache
            .sort((a, b) => b.position - a.position)
            .map(r => ({
                id: r.id,
                name: r.name,
                color: r.hexColor,
                position: r.position,
                permissions: r.permissions.bitfield.toString()
            }));

        res.json(roles);
    } catch (err) {
        console.error('Error fetching roles:', err);
        res.status(500).json({ error: err.message });
    }
});

// Manage Channel (Create/Delete)
router.post('/guilds/:guildId/channels', async (req, res) => {
    try {
        const { name, type } = req.body; // type: 0 = text, 2 = voice
        const guild = req.botClient.guilds.cache.get(req.params.guildId);
        const channel = await guild.channels.create({ name, type: type || 0 });

        // Audit Log
        if (req.user) {
            await logAction(req.params.guildId, 'create_channel', req.user, {
                name: channel.name,
                id: channel.id,
                type: type || 0
            });
        }

        res.json({ success: true, channel: { id: channel.id, name: channel.name } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/guilds/:guildId/channels/:channelId', async (req, res) => {
    try {
        const guild = req.botClient.guilds.cache.get(req.params.guildId);
        const channel = guild.channels.cache.get(req.params.channelId);
        if (channel) {
            await channel.delete();
            // Audit Log
            if (req.user) {
                await logAction(req.params.guildId, 'delete_channel', req.user, {
                    name: channel.name,
                    id: channel.id
                });
            }
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =======================
// BACKUP SYSTEM
// =======================

// Export Backup
router.get('/guilds/:guildId/backup', async (req, res) => {
    try {
        const settings = await Guild.findOne({ guildId: req.params.guildId }, { _id: 0, __v: 0 }).lean();
        if (!settings) return res.status(404).json({ message: 'Guild data not found' });

        const backupData = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            data: settings
        };

        res.setHeader('Content-Disposition', `attachment; filename=backup-${req.params.guildId}-${Date.now()}.json`);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(backupData, null, 2));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Restore Backup
router.post('/guilds/:guildId/backup', async (req, res) => {
    try {
        const { data } = req.body;
        if (!data || !data.guildId) return res.status(400).json({ message: 'Invalid backup file' });

        if (data.guildId !== req.params.guildId) {
            return res.status(400).json({ message: 'Backup file belongs to a different server!' });
        }

        // Restore settings (Upsert)
        // We delete _id to avoid collision if present, though we excluded it in export
        delete data._id;

        await Guild.findOneAndUpdate(
            { guildId: req.params.guildId },
            { $set: data },
            { new: true, upsert: true }
        );

        // Audit Log
        if (req.user) {
            logAction(req.params.guildId, 'RESTORE_BACKUP', req.user, { timestamp: new Date() });
        }

        res.json({ success: true, message: 'Backup restored successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =======================
// TICKET SYSTEM
// =======================

// Get Ticket Panels (List)
router.get('/guilds/:guildId/tickets/panels', async (req, res) => {
    try {
        const panels = await TicketPanel.find({ guildId: req.params.guildId });
        res.json(panels);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create/Update Ticket Panel
router.post('/guilds/:guildId/tickets/panel', async (req, res) => {
    try {
        const { uniqueId, ...updateData } = req.body;
        let panel;

        if (uniqueId) {
            // Update existing
            panel = await TicketPanel.findOneAndUpdate(
                { guildId: req.params.guildId, uniqueId: uniqueId },
                updateData,
                { new: true }
            );
            if (req.user) await logAction(req.params.guildId, 'UPDATE_TICKET_PANEL', req.user, { title: panel.title });
        } else {
            // Create new
            panel = new TicketPanel({
                guildId: req.params.guildId,
                ...updateData
            });
            await panel.save();
            if (req.user) await logAction(req.params.guildId, 'CREATE_TICKET_PANEL', req.user, { title: panel.title });
        }

        res.json(panel);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Ticket Panel
router.delete('/guilds/:guildId/tickets/panel/:uniqueId', async (req, res) => {
    try {
        await TicketPanel.deleteOne({ guildId: req.params.guildId, uniqueId: req.params.uniqueId });
        if (req.user) await logAction(req.params.guildId, 'DELETE_TICKET_PANEL', req.user, { panelId: req.params.uniqueId });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Deploy Ticket Panel to Channel
router.post('/guilds/:guildId/tickets/send', async (req, res) => {
    try {
        const { channelId, uniqueId } = req.body;

        let panel;
        if (uniqueId) {
            panel = await TicketPanel.findOne({ guildId: req.params.guildId, uniqueId });
        } else {
            // Fallback for old calls or if only one exists (get the latest)
            panel = await TicketPanel.findOne({ guildId: req.params.guildId }).sort({ createdAt: -1 });
        }

        if (!panel) return res.status(404).json({ message: 'Panel not configured' });

        const guild = req.botClient.guilds.cache.get(req.params.guildId);
        const channel = guild.channels.cache.get(channelId);

        if (!guild || !channel) return res.status(404).json({ message: 'Guild or Channel not found' });

        const embed = new EmbedBuilder()
            .setTitle(panel.title)
            .setDescription(panel.description)
            .setColor('#5865F2')
            .setFooter({ text: 'Powered by Rheox Tickets' });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`ticket_create_${panel.uniqueId}`) // Bind to specific panel
                    .setLabel(panel.buttonText)
                    .setEmoji(panel.buttonEmoji || '🎫')
                    .setStyle(ButtonStyle.Primary)
            );

        await channel.send({ embeds: [embed], components: [row] });

        // Audit Log
        if (req.user) {
            logAction(req.params.guildId, 'DEPLOY_TICKET_PANEL', req.user, { channelName: channel.name, panelTitle: panel.title });
        }

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Get Audit Logs
router.get('/guilds/:guildId/audit-logs', async (req, res) => {
    try {
        const logs = await AuditLog.find({ guildId: req.params.guildId })
            .sort({ timestamp: -1 })
            .limit(100);
        res.json(logs);
    } catch (err) {
        console.error('Audit Log Fetch Error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
