const { Events } = require('discord.js');
const mongoose = require('mongoose');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);

        const { REST, Routes, ActivityType } = require('discord.js');
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);
        const SystemConfig = require('../../models/SystemConfig');

        // Apply Status
        try {
            const config = await SystemConfig.findById('GLOBAL');
            if (config && config.botStatus) {
                const { status, activityType, activityText } = config.botStatus;

                // Map string type to ActivityType enum
                const typeMap = {
                    'Playing': ActivityType.Playing,
                    'Watching': ActivityType.Watching,
                    'Listening': ActivityType.Listening,
                    'Competing': ActivityType.Competing
                };

                client.user.setPresence({
                    status: status,
                    activities: [{
                        name: activityText,
                        type: typeMap[activityType] || ActivityType.Playing
                    }]
                });
                console.log(`✅ Status set to: ${status} | ${activityType} ${activityText}`);
            }
        } catch (err) {
            console.error('Failed to set bot status:', err);
        }

        const commands = [];
        client.commands.forEach(cmd => {
            commands.push(cmd.data.toJSON());
        });

        try {
            console.log(`Started refreshing ${commands.length} application (/) commands.`);

            const data = await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: commands },
            );

            console.log(`Successfully reloaded ${data.length} application (/) commands.`);
        } catch (error) {
            console.error(error);
        }
    },
};
