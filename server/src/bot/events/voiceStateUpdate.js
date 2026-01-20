const { Events, ChannelType, PermissionFlagsBits } = require('discord.js');
const Guild = require('../../models/Guild');

// Memory map to track temporary channels: { channelId: userId (owner) }
// Or better, just check if channel is empty and in the "Spawned" list?
// Simplest Auto-VC: 
// 1. Join Master -> Create Child -> Move User
// 2. Child Empty -> Delete

const tempChannels = new Set();

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState) {
        // --- Auto-VC Logic ---
        // User joined or moved channel
        if (newState.channelId && newState.channelId !== oldState.channelId) {
            const guildSettings = await Guild.findOne({ guildId: newState.guild.id });
            if (!guildSettings?.voiceConfig?.joinToCreateChannelId) return;

            const masterId = guildSettings.voiceConfig.joinToCreateChannelId;

            if (newState.channelId === masterId) {
                try {
                    // Create new channel
                    const parentCategory = newState.channel.parent;
                    const channelName = `🔊 ${newState.member.user.username}'s VC`;

                    const newChannel = await newState.guild.channels.create({
                        name: channelName,
                        type: ChannelType.GuildVoice,
                        parent: parentCategory,
                        permissionOverwrites: [
                            {
                                id: newState.member.id,
                                allow: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MoveMembers]
                            }
                        ]
                    });

                    // Track it
                    tempChannels.add(newChannel.id);

                    // Move member
                    await newState.member.voice.setChannel(newChannel);

                } catch (err) {
                    console.error('Auto-VC Create Error:', err);
                }
            }
        }

        // User left a channel
        if (oldState.channelId && oldState.channelId !== newState.channelId) {
            if (tempChannels.has(oldState.channelId)) {
                const channel = oldState.channel;
                if (channel && channel.members.size === 0) {
                    try {
                        await channel.delete();
                        tempChannels.delete(oldState.channelId);
                    } catch (err) {
                        console.error('Auto-VC Delete Error:', err);
                    }
                }
            }
        }
    }
};
