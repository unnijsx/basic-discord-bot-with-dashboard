const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { logAction } = require('../../../utils/auditLogger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a user from the server')
        .addUserOption(option => option.setName('target').setDescription('The user to kick').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Reason for the kick'))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    async execute(interaction) {
        const target = interaction.options.getMember('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!target) return interaction.reply({ content: '❌ User not found.', ephemeral: true });
        if (!target.kickable) return interaction.reply({ content: '❌ I cannot kick this user (missing permissions or role hierarchy).', ephemeral: true });

        try {
            await target.kick(reason);

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('👢 User Kicked')
                .setThumbnail(target.user.displayAvatarURL())
                .addFields(
                    { name: 'User', value: `${target.user.tag} (${target.id})`, inline: true },
                    { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            // Log
            await logAction(interaction.guild.id, 'MEMBER_KICK', interaction.user, { targetId: target.id, targetTag: target.user.tag, reason });

        } catch (error) {
            console.error(error);
            interaction.reply({ content: '❌ Failed to kick user.', ephemeral: true });
        }
    }
};
