const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Create a custom embed message')
        .addStringOption(option =>
            option.setName('title')
                .setDescription('Title of the embed')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Description of the embed')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('color')
                .setDescription('Hex color (e.g. #FF0000)'))
        .addStringOption(option =>
            option.setName('image')
                .setDescription('Image URL'))
        .addStringOption(option =>
            option.setName('footer')
                .setDescription('Footer text'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description');
        const color = interaction.options.getString('color') || '#5865F2';
        const image = interaction.options.getString('image');
        const footer = interaction.options.getString('footer');

        try {
            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(description.replace(/\\n/g, '\n')) // Support newlines
                .setColor(color);

            if (image) embed.setImage(image);
            if (footer) embed.setFooter({ text: footer });

            await interaction.channel.send({ embeds: [embed] });
            return interaction.reply({ content: '✅ Embed sent!', ephemeral: true });

        } catch (err) {
            return interaction.reply({ content: '❌ Invalid format (check color code or image URL).', ephemeral: true });
        }
    }
};
