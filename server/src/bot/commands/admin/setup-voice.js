const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const Guild = require('../../../models/Guild');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-voice')
        .setDescription('Configure temporary voice channel system.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Set the Join-to-Create channel')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The voice channel to use as the hub')
                        .addChannelTypes(ChannelType.GuildVoice)
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('disable')
                .setDescription('Disable the temporary voice system'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'set') {
            const channel = interaction.options.getChannel('channel');

            await Guild.findOneAndUpdate(
                { guildId: interaction.guild.id },
                {
                    $set: {
                        'voiceConfig.joinToCreateChannelId': channel.id,
                        'voiceConfig.categoryTargetId': channel.parentId // Optional: spawn in same category
                    }
                },
                { upsert: true }
            );

            return interaction.reply(`✅ **Join to Create** configured! Users joining <#${channel.id}> will now create their own temporary VCs.`);
        }

        if (subcommand === 'disable') {
            await Guild.findOneAndUpdate(
                { guildId: interaction.guild.id },
                { $unset: { voiceConfig: "" } }
            );
            return interaction.reply('🚫 Temporary voice system has been disabled.');
        }
    },
};
