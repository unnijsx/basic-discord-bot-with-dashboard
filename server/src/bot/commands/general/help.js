const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows a list of all available commands'),
    async execute(interaction) {
        const foldersPath = path.join(__dirname, '..'); // 'server/src/bot/commands' root
        const commandFolders = fs.readdirSync(foldersPath);

        const embed = new EmbedBuilder()
            .setTitle('🚀 Rheox Help Center')
            .setDescription('Here are all the commands you can use!')
            .setColor('#5865F2')
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setFooter({ text: 'Rheox Bot • v1.0' })
            .setTimestamp();

        for (const folder of commandFolders) {
            // Skip hidden or non-category folders if any (e.g., helpers)
            if (folder.startsWith('.') || folder === 'dev') continue;

            const commandsPath = path.join(foldersPath, folder);
            if (!fs.lstatSync(commandsPath).isDirectory()) continue;

            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
            if (commandFiles.length === 0) continue;

            const commandsList = commandFiles.map(file => {
                const cmd = require(path.join(commandsPath, file));
                return `\`/${cmd.data.name}\``;
            }).join(', ');

            // Capitalize folder name for category title
            const category = folder.charAt(0).toUpperCase() + folder.slice(1);
            embed.addFields({ name: `📂 ${category}`, value: commandsList });
        }

        await interaction.reply({ embeds: [embed] });
    },
};
