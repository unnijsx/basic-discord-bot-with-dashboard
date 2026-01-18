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
            return;
        }

        // --- Handle Modal Submissions ---
        if (interaction.isModalSubmit()) {
            if (interaction.customId.startsWith('form_submit_')) {
                const formId = interaction.customId.split('_')[2];
                await handleFormSubmit(interaction, formId);
            }
        }
    },
};

const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const Form = require('../../models/Form');

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
