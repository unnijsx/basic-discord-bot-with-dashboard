const { SlashCommandBuilder } = require('discord.js');
const Level = require('../../../models/Level');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Displays your current rank and XP.')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('The user to view rank for')),
    async execute(interaction) {
        const target = interaction.options.getUser('target') || interaction.user;
        const levelData = await Level.findOne({ userId: target.id, guildId: interaction.guild.id });

        if (!levelData) {
            return interaction.reply(`${target.tag} has not earned any XP yet.`);
        }

        // Calculate Rank position
        // This is expensive for large guilds, should be cached or optimized
        const count = await Level.countDocuments({
            guildId: interaction.guild.id,
            xp: { $gt: levelData.xp }
        });
        const rank = count + 1;

        const nextLevelXp = 300 * (levelData.level + 1);

        await interaction.reply({
            content: `📊 **Rank Card**: ${target.tag}\n` +
                `🏆 **Rank**: #${rank}\n` +
                `🔰 **Level**: ${levelData.level}\n` +
                `✨ **XP**: ${levelData.xp} / ${nextLevelXp}\n` +
                `(Need ${nextLevelXp - levelData.xp} more XP to level up!)`
        });
    },
};
