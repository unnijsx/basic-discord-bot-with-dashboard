const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays a song or playlist.')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('The song URL or name')
                .setRequired(true)),
    async execute(interaction) {
        const player = useMainPlayer();
        const channel = interaction.member.voice.channel;

        if (!channel) return interaction.reply('You are not connected to a voice channel!');
        if (!channel.joinable) return interaction.reply('I cannot join your voice channel!');

        await interaction.deferReply();
        const query = interaction.options.getString('query');

        if (query.toLowerCase() === 'debug') {
            const { spawnSync } = require('child_process');
            const { EmbedBuilder } = require('discord.js');
            const os = require('os');

            let ffmpegStatus = '❓ Unknown';
            try {
                const ffmpegRes = spawnSync(process.env.FFMPEG_PATH || 'ffmpeg', ['-version'], { encoding: 'utf-8' });
                if (ffmpegRes.error) ffmpegStatus = `❌ Error: ${ffmpegRes.error.message}`;
                else ffmpegStatus = `✅ Installed (${ffmpegRes.stdout.split('\n')[0].split('version')[1]?.trim() || 'Unknown Version'})`;
            } catch (e) { ffmpegStatus = `❌ Exception: ${e.message}`; }

            // Extractors validation
            const extractors = player.extractors.store.size > 0
                ? Array.from(player.extractors.store.keys()).map(k => `\`${k}\``).join(', ')
                : '❌ None Loaded';

            const embed = new EmbedBuilder()
                .setTitle('🛠️ System Diagnostics')
                .setColor('#2b2d31')
                .addFields(
                    { name: 'OS Platform', value: `${os.platform()} (${os.release()})`, inline: true },
                    { name: 'Node.js', value: process.version, inline: true },
                    { name: 'FFmpeg Path', value: `\`${process.env.FFMPEG_PATH || 'Global'}\``, inline: false },
                    { name: 'FFmpeg Status', value: ffmpegStatus, inline: false },
                    { name: 'Music Extractors', value: extractors, inline: false },
                    { name: 'Play-DL Source', value: 'Enabled (Mixed Mode)', inline: true }
                )
                .setTimestamp();

            return interaction.followUp({ embeds: [embed] });
        }

        try {
            const { track } = await player.play(channel, query, {
                nodeOptions: {
                    metadata: {
                        channel: interaction.channel,
                        client: interaction.guild.members.me,
                        requestedBy: interaction.user
                    }
                }
            });

            return interaction.followUp(`**${track.title}** enqueued!`);
        } catch (e) {
            console.error('Play Command Error:', e);

            // Detailed user feedback
            let msg = 'Unknown error';
            if (e.message.includes('ERR_NO_RESULT')) msg = '❌ No results found. (Possible GEO block or Invalid URL)';
            else if (e.message.includes('Could not extract stream')) msg = '❌ Stream extraction failed. (FFmpeg/Network issue)';
            else msg = `❌ Error: ${e.message}`;

            return interaction.followUp(`${msg}\n\`\`\`js\n${e.stack ? e.stack.substring(0, 200) : e.message}...\n\`\`\``);
        }
    },
};
