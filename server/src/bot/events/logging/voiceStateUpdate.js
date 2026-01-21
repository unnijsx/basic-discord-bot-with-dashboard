const { Events } = require('discord.js');
const { logAction } = require('../../../utils/auditLogger');

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState) {
        if (!oldState.member || oldState.member.user.bot) return;

        const guildId = oldState.guild.id || newState.guild.id;
        const client = oldState.client || newState.client;
        const user = oldState.member.user;

        let actionDetails = '';

        // Joined VC
        if (!oldState.channelId && newState.channelId) {
            actionDetails = `Joined voice channel **${newState.channel.name}**`;
        }
        // Left VC
        else if (oldState.channelId && !newState.channelId) {
            actionDetails = `Left voice channel **${oldState.channel.name}**`;
        }
        // Moved VC
        else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
            actionDetails = `Moved from **${oldState.channel.name}** to **${newState.channel.name}**`;
        } else {
            return; // Ignore mute/deafen updates for now
        }

        await logAction(
            guildId,
            'VOICE_STATE',
            user,
            actionDetails,
            null,
            client
        );
    },
};
