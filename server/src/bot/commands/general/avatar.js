const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Displays the avatar of a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to show avatar for')
                .setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;

        // Fetch member to get server-specific avatar
        let member;
        try {
            member = await interaction.guild.members.fetch(user.id);
        } catch (e) {
            member = null;
        }

        const globalAvatar = user.displayAvatarURL({ dynamic: true, size: 1024 });
        const serverAvatar = member ? member.avatarURL({ dynamic: true, size: 1024 }) : null;

        const embed = new EmbedBuilder()
            .setAuthor({ name: user.username, iconURL: globalAvatar })
            .setTitle('Avatar Link')
            .setURL(serverAvatar || globalAvatar)
            .setColor('#2b2d31')
            .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        // If user has a specific server avatar that is different from global
        if (serverAvatar && serverAvatar !== globalAvatar) {
            embed.setDescription('🌐 **Global & Server Avatar**');
            embed.setImage(serverAvatar); // Main big image
            embed.setThumbnail(globalAvatar); // Small corner image
        } else {
            // Only global avatar or they are the same
            embed.setImage(globalAvatar);
        }

        await interaction.reply({ embeds: [embed] });
    },
};
