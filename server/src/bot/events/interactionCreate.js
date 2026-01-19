const { Events } = require('discord.js');

const { checkMaintenance } = require('../../utils/maintenance');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // --- Maintenance Check ---
        const maintenance = await checkMaintenance(interaction.guildId, interaction.user.id);
        if (maintenance.active && !interaction.isModalSubmit()) { // Allow modal submits to flush? No, strict.
            // Actually, blocking modal submit is annoying if they spent time typing. 
            // But for safety, we block.
            if (maintenance.active) {
                const reply = { content: `🚫 **Maintenance Mode**: ${maintenance.reason}`, ephemeral: true };
                if (interaction.replied || interaction.deferred) await interaction.followUp(reply);
                else await interaction.reply(reply);
                return;
            }
        }

        // --- Handle Slash Commands ---
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(`[Command Error] ${interaction.commandName}:`, error);
                const errorMessage = {
                    content: '⚠️ An unexpected error occurred.',
                    ephemeral: true
                };
                if (interaction.replied || interaction.deferred) await interaction.followUp(errorMessage);
                else await interaction.reply(errorMessage);
            }
        }


        // --- Handle Buttons (Music & Forms) ---
        if (interaction.isButton()) {
            // Music Buttons
            if (interaction.customId.startsWith('music_')) {
                const { customId, guildId, client } = interaction;
                await interaction.deferUpdate();

                const player = client.shoukaku.players.get(guildId);
                const queue = client.queue?.get(guildId);

                if (!player) return; // Ignore if no player

                switch (customId) {
                    case 'music_pause':
                        const isPausing = !player.paused;
                        await player.setPaused(isPausing);
                        // Optional: Edit message to show status?
                        break;
                    case 'music_skip':
                        await player.stopTrack();
                        break;
                    case 'music_stop':
                        client.shoukaku.leaveVoiceChannel(guildId);
                        if (queue) {
                            queue.tracks = []; // Clear queue
                            queue.current = null;
                        }
                        break;
                }
                return;
            }

            // Form Buttons
            if (interaction.customId.startsWith('form_open_')) {
                const formId = interaction.customId.split('_')[2];
                await handleFormOpen(interaction, formId);
            }

            // Ticket Create Button
            if (interaction.customId === 'ticket_create' || interaction.customId.startsWith('ticket_create_')) {
                await handleTicketCreate(interaction);
            }
            if (interaction.customId === 'ticket_claim') {
                await handleTicketClaim(interaction);
            }
            if (interaction.customId === 'ticket_close_confirm') {
                await handleTicketClose(interaction);
            }
            return;
        }

        // --- Handle Modal Submissions ---
        if (interaction.isModalSubmit()) {
            if (interaction.customId.startsWith('form_submit_')) {
                const formId = interaction.customId.split('_')[2];
                await handleFormSubmit(interaction, formId);
            }
            // Ticket Modal Submit
            if (interaction.customId.startsWith('ticket_modal_')) {
                const uniqueId = interaction.customId.split('_')[2];
                await handleTicketModalSubmit(interaction, uniqueId);
            }
        }
    },
};

const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ChannelType, PermissionFlagsBits, ButtonBuilder, ButtonStyle } = require('discord.js');
const Form = require('../../models/Form');
const TicketPanel = require('../../models/TicketPanel');
const Ticket = require('../../models/Ticket');
const { logAction } = require('../../utils/auditLogger');

async function handleTicketCreate(interaction) {
    try {
        // 1. Identify Panel ID
        let panel;
        const parts = interaction.customId.split('_'); // ticket_create_UNIQUEID
        if (parts.length === 3) {
            const uniqueId = parts[2];
            panel = await TicketPanel.findOne({ guildId: interaction.guildId, uniqueId });
        } else {
            // Fallback
            panel = await TicketPanel.findOne({ guildId: interaction.guildId }).sort({ createdAt: -1 });
        }

        if (!panel) return interaction.reply({ content: '❌ Ticket panel configuration not found.', ephemeral: true });

        // 2. Check for Forms
        if (panel.formQuestions && panel.formQuestions.length > 0) {
            // SHOW MODAL
            const modal = new ModalBuilder()
                .setCustomId(`ticket_modal_${panel.uniqueId || 'default'}`)
                .setTitle('Ticket Details');

            panel.formQuestions.forEach((q, index) => {
                const input = new TextInputBuilder()
                    .setCustomId(`question_${index}`)
                    .setLabel(q.label.substring(0, 45))
                    .setRequired(q.required)
                    .setStyle(q.style === 'Short' ? TextInputStyle.Short : TextInputStyle.Paragraph);

                if (q.placeholder) input.setPlaceholder(q.placeholder);

                modal.addComponents(new ActionRowBuilder().addComponents(input));
            });

            await interaction.showModal(modal);
            return;
        }

        // 3. No Form -> Create Ticket Immediately
        await interaction.deferReply({ ephemeral: true });
        await createTicketChannel(interaction, panel, []);

    } catch (err) {
        console.error('Ticket Create Error:', err);
        if (interaction.deferred) await interaction.editReply('❌ Failed to create ticket. Check bot permissions.');
        else await interaction.reply({ content: '❌ Error creating ticket.', ephemeral: true });
    }
}

async function handleTicketModalSubmit(interaction, uniqueId) {
    try {
        await interaction.deferReply({ ephemeral: true });

        const panel = await TicketPanel.findOne({ guildId: interaction.guildId, uniqueId });
        if (!panel) return interaction.editReply('❌ Panel not found.');

        // Extract Answers
        const answers = [];
        panel.formQuestions.forEach((q, index) => {
            const answer = interaction.fields.getTextInputValue(`question_${index}`);
            answers.push({ question: q.label, answer });
        });

        await createTicketChannel(interaction, panel, answers);

    } catch (err) {
        console.error('Ticket Modal Error:', err);
        await interaction.editReply('❌ Failed to submit ticket form.');
    }
}

async function createTicketChannel(interaction, panel, formAnswers = []) {
    const { guild, user } = interaction;
    const channelName = panel.namingScheme
        .replace('{username}', user.username)
        .replace('{id}', user.id.substring(user.id.length - 4));

    const permissionOverwrites = [
        {
            id: guild.id,
            deny: [PermissionFlagsBits.ViewChannel]
        },
        {
            id: user.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
        },
        {
            id: interaction.client.user.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels]
        }
    ];

    if (panel.supportRole) {
        permissionOverwrites.push({
            id: panel.supportRole,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
        });
    }

    const ticketChannel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: panel.ticketCategory || null,
        permissionOverwrites
    });

    const newTicket = new Ticket({
        guildId: guild.id,
        channelId: ticketChannel.id,
        userId: user.id,
        status: 'open'
    });
    await newTicket.save();

    const embed = new EmbedBuilder()
        .setTitle(`Ticket: ${channelName}`)
        .setDescription(`Hello ${user}, support will be with you shortly.\n\nTo close this ticket, use the button below or \`/ticket close\`.`)
        .setColor('#5865F2');

    if (formAnswers.length > 0) {
        const fields = formAnswers.map(a => ({ name: a.question, value: a.answer }));
        embed.addFields(fields);
    }

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setLabel('Close Ticket')
                .setCustomId('ticket_close_confirm')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🔒'),
            new ButtonBuilder()
                .setLabel('Claim Ticket')
                .setCustomId('ticket_claim')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('🙋‍♂️')
        );

    await ticketChannel.send({ content: `${user} <@&${panel.supportRole || ''}>`, embeds: [embed], components: [row] });

    await logAction(guild.id, 'TICKET_CREATE', user, { channelName, ticketId: newTicket._id });

    await interaction.editReply(`✅ Ticket created: ${ticketChannel}`);
}

async function handleTicketClaim(interaction) {
    try {
        await interaction.deferUpdate();
        const { channel, user, guild } = interaction;

        const ticket = await Ticket.findOne({ channelId: channel.id });
        if (!ticket) return interaction.followUp({ content: '❌ Ticket not found in DB.', ephemeral: true });

        if (ticket.claimedBy) {
            return interaction.followUp({ content: `❌ Already claimed by <@${ticket.claimedBy}>`, ephemeral: true });
        }

        ticket.claimedBy = user.id;
        await ticket.save();

        // Update Embed
        const oldEmbed = interaction.message.embeds[0];
        const newEmbed = new EmbedBuilder(oldEmbed.data)
            .addFields({ name: 'Claimed By', value: `${user} 🙋‍♂️` })
            .setColor('#FEE75C'); // Yellow for claimed

        // Disable Claim Button
        const oldRow = interaction.message.components[0];
        const newRow = new ActionRowBuilder();

        oldRow.components.forEach(comp => {
            if (comp.customId === 'ticket_claim') {
                const disabledBtn = ButtonBuilder.from(comp).setDisabled(true).setLabel(`Claimed by ${user.username}`);
                newRow.addComponents(disabledBtn);
            } else {
                newRow.addComponents(comp);
            }
        });

        await interaction.editReply({ embeds: [newEmbed], components: [newRow] });
        await channel.send(`🙋‍♂️ **${user}** has claimed this ticket.`);

        await logAction(guild.id, 'TICKET_CLAIM', user, { channelName: channel.name });

    } catch (err) {
        console.error('Ticket Claim Error:', err);
    }
}

async function handleTicketClose(interaction) {
    try {
        await interaction.deferReply();
        const { channel, guild, user } = interaction;

        const ticketData = await Ticket.findOne({ channelId: channel.id });
        if (!ticketData) return interaction.editReply('❌ Ticket not found in DB.');

        // 1. Fetch Messages
        let messages = await channel.messages.fetch({ limit: 100 });

        // 2. Generate Transcript
        const buffer = await generateTranscript(channel, messages);
        const attachment = new AttachmentBuilder(buffer, { name: `transcript-${channel.name}.html` });

        // 3. DM User
        try {
            const ticketOwner = await guild.members.fetch(ticketData.userId);
            if (ticketOwner) {
                await ticketOwner.send({
                    content: `Your ticket **${channel.name}** in **${guild.name}** has been closed.`,
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
            ticketId: ticketData._id
        });

        // 6. Respond and Delete
        await interaction.editReply({ content: '✅ Ticket closed. Deleting channel in 5 seconds...', files: [attachment] });

        setTimeout(() => {
            channel.delete().catch(() => { });
        }, 5000);

    } catch (err) {
        console.error('Ticket Close Error:', err);
    }
}

async function handleFormOpen(interaction, formId) {
    try {
        const form = await Form.findById(formId);
        if (!form || !form.isEnabled) {
            return interaction.reply({ content: '❌ This form is no longer available.', ephemeral: true });
        }

        const modal = new ModalBuilder()
            .setCustomId(`form_submit_${formId}`)
            .setTitle(form.title.substring(0, 45)); // Max 45 chars

        // Add inputs
        form.questions.slice(0, 5).forEach(q => { // Max 5 components per modal
            const input = new TextInputBuilder()
                .setCustomId(q.id)
                .setLabel(q.label.substring(0, 45))
                .setRequired(q.required);

            if (q.type === 'paragraph') input.setStyle(TextInputStyle.Paragraph);
            else input.setStyle(TextInputStyle.Short);

            if (q.type === 'multiple_choice' && q.options.length > 0) {
                input.setPlaceholder(`Options: ${q.options.join(', ')}`);
            }

            modal.addComponents(new ActionRowBuilder().addComponents(input));
        });

        await interaction.showModal(modal);
    } catch (err) {
        console.error('Form Open Error:', err);
        interaction.reply({ content: 'Failed to open form.', ephemeral: true });
    }
}

async function handleFormSubmit(interaction, formId) {
    try {
        await interaction.deferReply({ ephemeral: true });
        const form = await Form.findById(formId);

        if (!form) return interaction.editReply('❌ Form not found.');

        const results = [];
        form.questions.slice(0, 5).forEach(q => {
            const answer = interaction.fields.getTextInputValue(q.id);
            results.push({ question: q.label, answer });
        });

        // Send to Channel
        const channel = interaction.guild.channels.cache.get(form.responseChannelId);
        if (channel) {
            const embed = new EmbedBuilder()
                .setTitle(`📝 Form Submission: ${form.title}`)
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setDescription(results.map(r => `**${r.question}**\n${r.answer}`).join('\n\n'))
                .setColor('#00b0f4')
                .setTimestamp();

            await channel.send({ embeds: [embed] });
            await interaction.editReply('✅ Submission received!');

            // Log to Audit Log
            const { logAction } = require('../../utils/auditLogger');
            logAction(interaction.guild.id, 'FORM_SUBMIT', interaction.user, { formTitle: form.title, formId });
        } else {
            await interaction.editReply('❌ Configuration Error: Response channel not found.');
        }

    } catch (err) {
        console.error('Form Submit Error:', err);
        if (interaction.deferred) interaction.editReply('Failed to process submission.');
    }
}
