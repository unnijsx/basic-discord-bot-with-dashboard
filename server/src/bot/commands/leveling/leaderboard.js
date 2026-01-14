const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Level = require('../../../models/Level');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Displays the top 10 users with the most XP.'),
    async execute(interaction) {
        const topUsers = await Level.find({ guildId: interaction.guild.id })
            .sort({ xp: -1 })
            .limit(10); // Get top 10

        if (topUsers.length === 0) {
            return interaction.reply('No leaderboard data found!');
        }

        const embed = new EmbedBuilder()
            .setTitle(`🏆 Leaderboard for ${interaction.guild.name}`)
            .setColor(0xFFD700)
            .setTimestamp();

        let description = '';
        for (let i = 0; i < topUsers.length; i++) {
            const userLevel = topUsers[i];
            let userTag = userLevel.userId;

            try {
                // Fetch user to get username
                const member = await interaction.guild.members.fetch(userLevel.userId);
                userTag = member.user.tag;
            } catch (err) {
                // User might have left
                userTag = 'Unknown User';
            }

            description += `**${i + 1}.** ${userTag} - Level ${userLevel.level} (${userLevel.xp} XP)\n`;
        }

        embed.setDescription(description);
        await interaction.reply({ embeds: [embed] });
    },
};
