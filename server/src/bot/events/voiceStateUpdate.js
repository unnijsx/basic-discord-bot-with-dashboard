const { Events, ChannelType, PermissionFlagsBits } = require('discord.js');
const Guild = require('../../models/Guild');
const TempChannel = require('../../models/TempChannel');

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

        // 1. User joined a channel (or switched)
        if (newState.channelId && newState.channelId !== oldState.channelId) {
            try {
                const guildSettings = await Guild.findOne({ guildId: newState.guild.id });
                if (!guildSettings?.voiceConfig?.joinToCreateChannelId) return;

                const masterId = guildSettings.voiceConfig.joinToCreateChannelId;

                if (newState.channelId === masterId) {
                    // Create new channel
                    const parentCategory = newState.channel.parent;
                    const channelName = `🔊 ${newState.member.user.username}'s VC`;

                    const newChannel = await newState.guild.channels.create({
                        name: channelName,
                        type: ChannelType.GuildVoice,
                        parent: parentCategory || guildSettings.voiceConfig.categoryTargetId,
                        permissionOverwrites: [
                            {
                                id: newState.member.id,
                                allow: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MoveMembers]
                            }
                        ]
                    });

                    // Persist to DB
                    await TempChannel.create({
                        guildId: newState.guild.id,
                        channelId: newChannel.id,
                        ownerId: newState.member.id
                    });

                    // Move member
                    await newState.member.voice.setChannel(newChannel);
                }
            } catch (err) {
                console.error('Auto-VC Create Error:', err);
            }
        }

        // 2. User left a channel (or switched)
        if (oldState.channelId && oldState.channelId !== newState.channelId) {
            try {
                // Check if this channel is a Temp Channel
                const isTemp = await TempChannel.findOne({ channelId: oldState.channelId });

                if (isTemp) {
                    const channel = oldState.channel;
                    // If channel is empty (0 members), delete it
                    if (channel && channel.members.size === 0) {
                        await channel.delete();
                        await TempChannel.deleteOne({ channelId: oldState.channelId });
                    }
                }
            } catch (err) {
                console.error('Auto-VC Delete Error:', err);
            }
        }
    }
};
