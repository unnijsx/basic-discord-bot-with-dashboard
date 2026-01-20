const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Suggestion = require('../../../models/Suggestion');
const Guild = require('../../../models/Guild');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('suggest')
        .setDescription('Submit a suggestion for the server')
        .addStringOption(option =>
            option.setName('idea')
                .setDescription('Your suggestion')
                .setRequired(true)),

    async execute(interaction) {
        const idea = interaction.options.getString('idea');

        // 1. Get Suggestion Channel from Config
        // const guildConfig = await Guild.findOne({ guildId: interaction.guild.id });
        // const channelId = guildConfig?.suggestionChannelId;
        // For MVP, letting user pick or defaulting to current is messy.
        // Let's look for a channel named "suggestions" if not configured?
        const channel = interaction.guild.channels.cache.find(c => c.name === 'suggestions' || c.name === 'feedback');

        if (!channel) {
            return interaction.reply({ content: '❌ No `#suggestions` channel found. Ask an admin to create one!', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
            .setTitle('💡 New Suggestion')
            .setDescription(idea)
            .setColor('#eb459e')
            .addFields(
                { name: 'Status', value: '⏳ Pending', inline: true },
                { name: 'Votes', value: '⬆️ 0 | ⬇️ 0', inline: true }
            )
            .setFooter({ text: 'Suggestion ID: Pending...' })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('suggest_up').setLabel('Upvote').setStyle(ButtonStyle.Success).setEmoji('⬆️'),
            new ButtonBuilder().setCustomId('suggest_down').setLabel('Downvote').setStyle(ButtonStyle.Danger).setEmoji('⬇️')
        );

        const msg = await channel.send({ embeds: [embed], components: [row] });

        // Save to DB
        const suggestion = new Suggestion({
            guildId: interaction.guild.id,
            userId: interaction.user.id,
            suggestion: idea,
            messageId: msg.id,
            channelId: channel.id
        });
        await suggestion.save();

        // Update footer with ID
        const newEmbed = EmbedBuilder.from(embed).setFooter({ text: `Suggestion ID: ${suggestion._id}` });
        await msg.edit({ embeds: [newEmbed] });

        return interaction.reply({ content: `✅ Suggestion submitted to ${channel}!`, ephemeral: true });
    }
};
