const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const CATEGORY_MAP = {
    'economy': { emoji: '💰', label: 'Economy', description: 'Manage your wealth' },
    'general': { emoji: '🌍', label: 'General', description: 'Basic commands' },
    'leveling': { emoji: '📊', label: 'Leveling', description: 'XP and Ranks' },
    'moderation': { emoji: '🛡️', label: 'Moderation', description: 'Admin tools' },
    'music': { emoji: '🎵', label: 'Music', description: 'Play some tunes' },
    'tickets': { emoji: '🎫', label: 'Tickets', description: 'Support system' }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows a list of all available commands'),
    async execute(interaction) {
        const foldersPath = path.join(__dirname, '..');
        const commandFolders = fs.readdirSync(foldersPath);

        const embed = new EmbedBuilder()
            .setTitle('🦾 Rheox Command Center')
            .setDescription('Select a category below to view commands.')
            .setColor('#5865F2')
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setImage('https://media.discordapp.net/attachments/123000000000000000/123000000000000000/banner.png?width=1000') // Optional placeholder
            .setFooter({ text: `Rheox Bot • v2.0 • Dashboard: ${process.env.FRONTEND_URL || 'https://your-dashboard-url.com'}`, iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Dashboard')
                    .setStyle(ButtonStyle.Link)
                    .setURL(process.env.FRONTEND_URL || 'https://basic-discord-bot-with-dashboard.vercel.app'),
                new ButtonBuilder()
                    .setLabel('Support')
                    .setStyle(ButtonStyle.Link)
                    .setURL(process.env.DISCORD_SUPPORT_SERVER || 'https://discord.gg/your-invite'),
                new ButtonBuilder()
                    .setLabel('Privacy')
                    .setStyle(ButtonStyle.Link)
                    .setURL(`${process.env.FRONTEND_URL || 'https://basic-discord-bot-with-dashboard.vercel.app'}/privacy`),
                new ButtonBuilder()
                    .setLabel('Terms')
                    .setStyle(ButtonStyle.Link)
                    .setURL(`${process.env.FRONTEND_URL || 'https://basic-discord-bot-with-dashboard.vercel.app'}/terms`)
            );

        const categories = [];

        for (const folder of commandFolders) {
            if (folder.startsWith('.') || folder === 'dev') continue;

            const commandsPath = path.join(foldersPath, folder);
            if (!fs.lstatSync(commandsPath).isDirectory()) continue;

            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
            if (commandFiles.length === 0) continue;

            const commandList = commandFiles.map(file => {
                const cmd = require(path.join(commandsPath, file));
                return `\`/${cmd.data.name}\``;
            }).join(', ');

            const info = CATEGORY_MAP[folder] || { emoji: '📂', label: folder.charAt(0).toUpperCase() + folder.slice(1), description: 'Misc commands' };

            categories.push({
                folder,
                info,
                commands: commandList
            });

            embed.addFields({
                name: `${info.emoji} ${info.label}`,
                value: commandList || 'No commands found',
                inline: false
            });
        }

        // Just sending the embed for now. Can add a Select Menu later for detailed view if list gets too long.
        await interaction.reply({ embeds: [embed], components: [row] });
    },
};
