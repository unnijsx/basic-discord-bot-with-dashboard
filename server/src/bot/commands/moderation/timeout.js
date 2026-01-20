const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { logAction } = require('../../../utils/auditLogger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeout (mute) a user')
        .addUserOption(option => option.setName('target').setDescription('User to timeout').setRequired(true))
        .addIntegerOption(option => option.setName('duration').setDescription('Duration in Minutes').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Reason for timeout'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const target = interaction.options.getMember('target');
        const duration = interaction.options.getInteger('duration'); // Minutes
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!target) return interaction.reply({ content: '❌ User not found in this server.', ephemeral: true });
        if (!target.moderatable) return interaction.reply({ content: '❌ I cannot timeout this user (missing permissions or role hierarchy).', ephemeral: true });

        try {
            const ms = duration * 60 * 1000;
            if (ms > 28 * 24 * 60 * 60 * 1000) return interaction.reply({ content: '❌ Max timeout duration is 28 days.', ephemeral: true });

            await target.timeout(ms, reason);

            const embed = new EmbedBuilder()
                .setColor('#FEE75C')
                .setTitle('⏳ User Timed Out')
                .setThumbnail(target.user.displayAvatarURL())
                .addFields(
                    { name: 'User', value: `${target.user.tag}`, inline: true },
                    { name: 'Duration', value: `${duration} minutes`, inline: true },
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            // Log
            await logAction(interaction.guild.id, 'MEMBER_TIMEOUT', interaction.user, { targetId: target.id, targetTag: target.user.tag, duration, reason });

        } catch (error) {
            console.error(error);
            interaction.reply({ content: '❌ Failed to timeout user.', ephemeral: true });
        }
    }
};
