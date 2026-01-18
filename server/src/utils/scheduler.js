const cron = require('node-cron');
const ScheduledMessage = require('../models/ScheduledMessage');
const { EmbedBuilder } = require('discord.js');

class SchedulerManager {
    constructor() {
        this.jobs = new Map(); // Map<msgId, cronJob>
        this.client = null;
    }

    init(client) {
        this.client = client;
        this.loadJobs();
        console.log('✅ Scheduler Manager Initialized');
    }

    async loadJobs() {
        try {
            const messages = await ScheduledMessage.find({ isEnabled: true });
            messages.forEach(msg => this.schedule(msg));
            console.log(`🕒 Loaded ${messages.length} scheduled messages.`);
        } catch (err) {
            console.error('Failed to load scheduled messages:', err);
        }
    }

    schedule(msg) {
        // If job already exists, stop it first (update case)
        if (this.jobs.has(msg._id.toString())) {
            this.jobs.get(msg._id.toString()).stop();
        }

        if (!msg.isEnabled) return;

        try {
            const job = cron.schedule(msg.cronExpression, () => this.execute(msg), {
                timezone: msg.timezone || 'UTC'
            });
            this.jobs.set(msg._id.toString(), job);
        } catch (err) {
            console.error(`Failed to schedule message ${msg._id}:`, err.message);
        }
    }

    unschedule(msgId) {
        if (this.jobs.has(msgId)) {
            this.jobs.get(msgId).stop();
            this.jobs.delete(msgId);
        }
    }

    async execute(msg) {
        try {
            const guild = this.client.guilds.cache.get(msg.guildId);
            if (!guild) return console.warn(`Scheduler: Guild ${msg.guildId} not found`);

            const channel = guild.channels.cache.get(msg.channelId);
            if (!channel) return console.warn(`Scheduler: Channel ${msg.channelId} not found`);

            const payload = {};
            if (msg.content) payload.content = msg.content;
            if (msg.embed && msg.embed.description) {
                const embed = new EmbedBuilder()
                    .setDescription(msg.embed.description);
                if (msg.embed.title) embed.setTitle(msg.embed.title);
                if (msg.embed.color) embed.setColor(msg.embed.color);
                if (msg.embed.image) embed.setImage(msg.embed.image);
                if (msg.embed.footer) embed.setFooter({ text: msg.embed.footer });
                payload.embeds = [embed];
            }

            await channel.send(payload);
            console.log(`Executed scheduled message ${msg._id} in ${guild.name}`);

            // Optional: Update last run time in DB
        } catch (err) {
            console.error(`Error executing scheduled message ${msg._id}:`, err);
        }
    }
}

module.exports = new SchedulerManager();
