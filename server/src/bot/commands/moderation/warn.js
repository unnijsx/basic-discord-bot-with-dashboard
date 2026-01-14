const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
// In a real app, import Warning model here

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a user.')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('The member to warn')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('The reason for warning')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setDMPermission(false),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason');

        // database logic would go here
        // e.g., await Warning.create({ guildId: interaction.guild.id, userId: target.id, reason });

        await interaction.reply(`⚠️ ${target.tag} has been warned for: ${reason}`);

        try {
            await target.send(`You have been warned in ${interaction.guild.name} for: ${reason}`);
        } catch (error) {
            // User might have DMs off
        }
    },
};
