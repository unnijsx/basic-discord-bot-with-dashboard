const { Events, EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');

module.exports = {
    name: Events.GuildCreate,
    async execute(guild) {
        try {
            // 1. Try system channel first
            let channel = guild.systemChannel;

            // 2. If no system channel, find first sendable text channel
            if (!channel) {
                channel = guild.channels.cache.find(c =>
                    c.type === ChannelType.GuildText &&
                    c.permissionsFor(guild.members.me).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel])
                );
            }

            if (!channel) return;

            const welcomeEmbed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🚀 Thanks for adding Rheox!')
                .setDescription('Rheox is here to supercharge your server with advanced moderation, leveling, music, and more.')
                .addFields(
                    { name: '📊 Dashboard', value: '[Click Here](http://localhost:5173/dashboard)', inline: true },
                    { name: '🆘 Support Server', value: '[Join Support](https://discord.gg/gyQh6KaSbp)', inline: true },
                    { name: '📸 Instagram', value: '[Follow Us](instagram.com/u/rheox_)', inline: true }
                )
                .setImage('https://media.discordapp.net/attachments/1187433894874452038/1202288056212357171/standard.gif?ex=65ccda2d&is=65ba652d&hm=6a2569209581f129524021703646545127606305606400970710636737560172&=') // Replace with a relevant nice gif if needed
                .setFooter({ text: 'Rheox Development Team', iconURL: guild.client.user.displayAvatarURL() })
                .setTimestamp();

            await channel.send({ embeds: [welcomeEmbed] });

        } catch (error) {
            console.error(`Failed to send welcome message in guild: ${guild.id}`, error);
        }
    },
};
