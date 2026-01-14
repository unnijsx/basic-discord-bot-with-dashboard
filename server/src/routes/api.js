const router = require('express').Router();
const Guild = require('../models/Guild');
const { EmbedBuilder } = require('discord.js');
const Level = require('../models/Level');

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
        if (moderationConfig) updateData.moderationConfig = moderationConfig;
        if (levelingConfig) updateData.levelingConfig = levelingConfig;
        if (loggingConfig) updateData.loggingConfig = loggingConfig;
        if (req.body.welcomeConfig) updateData.welcomeConfig = req.body.welcomeConfig;

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
        if (embed) {
            const embedObj = new EmbedBuilder();
            if (embed.title) embedObj.setTitle(embed.title);
            if (embed.description) embedObj.setDescription(embed.description);
            if (embed.color) embedObj.setColor(embed.color);
            if (embed.image) embedObj.setImage(embed.image);
            if (embed.thumbnail) embedObj.setThumbnail(embed.thumbnail);
            if (embed.footer) embedObj.setFooter({ text: embed.footer });
            payload.embeds = [embedObj];
        }

        await channel.send(payload);
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
        res.json({ success: true, channel: { id: channel.id, name: channel.name } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/guilds/:guildId/channels/:channelId', async (req, res) => {
    try {
        const guild = req.botClient.guilds.cache.get(req.params.guildId);
        const channel = guild.channels.cache.get(req.params.channelId);
        if (channel) await channel.delete();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
