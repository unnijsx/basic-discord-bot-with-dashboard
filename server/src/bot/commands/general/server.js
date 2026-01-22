const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Displays information about the server'),

    async execute(interaction) {
        if (!interaction.guild) return interaction.reply('This command can only be used in a server.');

        // Defer reply as we might need to fetch owner/members
        await interaction.deferReply();

        const guild = await interaction.guild.fetch({ withCounts: true });
        const owner = await guild.fetchOwner();

        // Channels counts
        const totalChannels = guild.channels.cache.size;
        const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
        const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
        // You could also count categories/announcement channels if needed, but text/voice is standard request.

        // Member counts
        const totalMembers = guild.memberCount;
        const onlineCount = guild.approximatePresenceCount; // Requires intent/fetch
        const boosts = guild.premiumSubscriptionCount;

        // Roles
        const roleCount = guild.roles.cache.size;

        // Formatting Created At
        // We can use discord.js time formatting or manual.
        // Image shows: "Jul 17 Created On \n 4 years ago"
        // We'll use Discord's timestamp formatting which is localized and safe.
        // <t:TIMESTAMP:D> = 17 July 2021
        // <t:TIMESTAMP:R> = 4 years ago
        const createdTimestamp = Math.floor(guild.createdTimestamp / 1000);

        const embed = new EmbedBuilder()
            .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL({ dynamic: true })
            })
            .setThumbnail(guild.iconURL({ dynamic: true, size: 512 }))
            .setColor('#2b2d31') // Dark embed color
            .addFields(
                {
                    name: '🆔 Server ID',
                    value: guild.id,
                    inline: true
                },
                {
                    name: '📅 Created On',
                    value: `<t:${createdTimestamp}:D>\n<t:${createdTimestamp}:R>`,
                    inline: true
                },
                {
                    name: '👑 Owned by',
                    value: owner.user.toString(),
                    inline: true
                },
                {
                    name: `👥 Members (${totalMembers})`,
                    value: `${onlineCount !== null ? `**${onlineCount}** Online` : 'Unknown Online'}\n**${boosts}** Boosts ✨`,
                    inline: true
                },
                {
                    name: `💬 Channels (${totalChannels})`,
                    value: `**${textChannels}** Text | **${voiceChannels}** Voice`,
                    inline: true
                },
                {
                    name: '🌍 Others',
                    value: `**Verification Level:** ${guild.verificationLevel}`,
                    inline: true
                },
                {
                    name: `🔐 Roles (${roleCount})`,
                    value: 'To see a list with all roles use **/roles**',
                    inline: false
                }
            );

        if (guild.bannerURL()) {
            embed.setImage(guild.bannerURL({ dynamic: true, size: 1024 }));
        }

        await interaction.editReply({ embeds: [embed] });
    }
};
