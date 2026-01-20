const { SlashCommandBuilder } = require('discord.js');
const User = require('../../../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Set your AFK status')
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for being AFK')),

    async execute(interaction) {
        const reason = interaction.options.getString('reason') || 'AFK';

        // Find and update user
        let userProfile = await User.findOne({ discordId: interaction.user.id });
        if (!userProfile) {
            userProfile = new User({ discordId: interaction.user.id, username: interaction.user.username });
        }

        userProfile.afk = {
            isAfk: true,
            reason: reason,
            timestamp: new Date()
        };
        await userProfile.save();

        // Try to rename user
        try {
            if (interaction.guild.members.me.permissions.has('ManageNicknames')) {
                const member = interaction.member;
                if (!member.nickname?.startsWith('[AFK]')) {
                    await member.setNickname(`[AFK] ${member.displayName}`.substring(0, 32));
                }
            }
        } catch (e) {
            // Ignore (hierarchy issues)
        }

        return interaction.reply({ content: `💤 I set your AFK: **${reason}**`, ephemeral: true });
    }
};
