const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Guild = require('../../../models/Guild');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reactionrole')
        .setDescription('Create a self-assignable role panel')
        .addRoleOption(option => option.setName('role').setDescription('Role to assign').setRequired(true))
        .addStringOption(option => option.setName('description').setDescription('Description for the embed').setRequired(true))
        .addStringOption(option => option.setName('emoji').setDescription('Emoji for the button'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        const role = interaction.options.getRole('role');
        const description = interaction.options.getString('description');
        const emoji = interaction.options.getString('emoji') || '🎭';

        // Check hierarchy
        if (interaction.guild.members.me.roles.highest.position <= role.position) {
            return interaction.reply({ content: '❌ I cannot assign this role (it is higher than or equal to my highest role).', ephemeral: true });
        }

        // For MVP, we send a new message every time. 
        // In full production, we'd allow "adding" to existing messages using message ID.

        const embed = new EmbedBuilder()
            .setTitle('Role Assignment')
            .setDescription(description)
            .setColor(role.color || '#5865F2')
            .setFooter({ text: 'Click the button below to toggle this role.' });

        const button = new ButtonBuilder()
            .setCustomId(`role_${role.id}`)
            .setLabel(role.name)
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(emoji);

        const row = new ActionRowBuilder().addComponents(button);

        const msg = await interaction.channel.send({ embeds: [embed], components: [row] });

        // Save to DB (Optional for MVP button handling, but good for tracking)
        // We'll trust the customId `role_ID` for stateless handling in interactionCreate.

        return interaction.reply({ content: `✅ Reaction role created in this channel!`, ephemeral: true });
    }
};
