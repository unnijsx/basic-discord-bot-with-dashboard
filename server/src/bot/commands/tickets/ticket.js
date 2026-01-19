const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const Ticket = require('../../../models/Ticket');
const TicketPanel = require('../../../models/TicketPanel');
const { generateTranscript } = require('../../../utils/transcriptGenerator');
const { logAction } = require('../../../utils/auditLogger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Manage support tickets')
        .addSubcommand(sub =>
            sub.setName('setup')
                .setDescription('Setup the ticket panel in this channel (Admin Only)')
        )
        .addSubcommand(sub =>
            sub.setName('close')
                .setDescription('Close the current ticket')
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for closing')
                )
        )
        .addSubcommand(sub =>
            sub.setName('add')
                .setDescription('Add a user to this ticket')
                .addUserOption(option => option.setName('user').setDescription('User to add').setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName('remove')
                .setDescription('Remove a user from this ticket')
                .addUserOption(option => option.setName('user').setDescription('User to remove').setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName('transcript')
                .setDescription('Generate a transcript of this ticket')
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const { guild, channel, user, member } = interaction;

        // Check if current channel is a ticket
        const ticketData = await Ticket.findOne({ channelId: channel.id });
        if (!ticketData && subcommand !== 'setup') {
            return interaction.reply({ content: '❌ This command can only be used in a ticket channel.', ephemeral: true });
        }

        if (subcommand === 'setup') {
            // Check Admin Perms
            if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: '❌ Only Administrators can use this command.', ephemeral: true });
            }

            await interaction.deferReply({ ephemeral: true });

            // Fetch Panel Config or Create Default
            let panel = await TicketPanel.findOne({ guildId: guild.id });
            if (!panel) {
                panel = new TicketPanel({
                    guildId: guild.id,
                    ticketCategory: channel.parentId // Default to current category
                });
                await panel.save();
            }

            // Create Embed
            const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
            const embed = new EmbedBuilder()
                .setTitle(panel.title)
                .setDescription(panel.description)
                .setColor('#5865F2')
                .setFooter({ text: 'Powered by Rheox Tickets' });

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('ticket_create')
                        .setLabel(panel.buttonText)
                        .setEmoji(panel.buttonEmoji || '🎫')
                        .setStyle(ButtonStyle.Primary)
                );

            await channel.send({ embeds: [embed], components: [row] });
            await interaction.editReply('✅ Ticket Panel deployed to this channel!');

            // Log
            await logAction(guild.id, 'DEPLOY_TICKET_PANEL', user, { channelName: channel.name });
            return;
        }

        if (subcommand === 'close') {
            await interaction.deferReply();

            // 1. Fetch Messages
            let messages = await channel.messages.fetch({ limit: 100 });
            // In a real app, you might want to fetch ALL messages, looping until 0 retrieved.

            // 2. Generate Transcript
            const buffer = await generateTranscript(channel, messages);
            const attachment = new AttachmentBuilder(buffer, { name: `transcript-${channel.name}.html` });
            const reason = interaction.options.getString('reason') || 'No reason provided';

            // 3. DM User
            try {
                const ticketOwner = await guild.members.fetch(ticketData.userId);
                if (ticketOwner) {
                    await ticketOwner.send({
                        content: `Your ticket **${channel.name}** in **${guild.name}** has been closed.\nReason: ${reason}`,
                        files: [attachment]
                    });
                }
            } catch (e) {
                console.log('Could not DM user transcript');
            }

            // 4. Update Database
            ticketData.status = 'closed';
            ticketData.closedAt = new Date();
            ticketData.closedBy = user.id;

            // Save Message History for Web Dashboard
            ticketData.messages = messages.reverse().map(m => ({
                authorId: m.author.id,
                authorName: m.author.username,
                authorAvatar: m.author.displayAvatarURL(),
                content: m.content,
                attachments: m.attachments.map(a => a.url),
                timestamp: m.createdTimestamp
            }));

            await ticketData.save();

            // 5. Log Action
            await logAction(guild.id, 'TICKET_CLOSE', user, {
                channelName: channel.name,
                ticketId: ticketData._id,
                reason
            });

            // 6. Respond and Delete
            await interaction.editReply({ content: '✅ Ticket closed. Deleting channel in 5 seconds...', files: [attachment] });

            setTimeout(() => {
                channel.delete().catch(() => { });
            }, 5000);
        }

        if (subcommand === 'add') {
            const target = interaction.options.getUser('user');
            await channel.permissionOverwrites.edit(target, {
                ViewChannel: true,
                SendMessages: true
            });
            await interaction.reply(`✅ Added ${target} to the ticket.`);
        }

        if (subcommand === 'remove') {
            const target = interaction.options.getUser('user');
            await channel.permissionOverwrites.delete(target);
            await interaction.reply(`✅ Removed ${target} from the ticket.`);
        }

        if (subcommand === 'transcript') {
            await interaction.deferReply();
            let messages = await channel.messages.fetch({ limit: 100 });
            const buffer = await generateTranscript(channel, messages);
            const attachment = new AttachmentBuilder(buffer, { name: `transcript-${channel.name}.html` });
            await interaction.editReply({ content: '📄 Here is the ticket transcript:', files: [attachment] });
        }
    }
};
