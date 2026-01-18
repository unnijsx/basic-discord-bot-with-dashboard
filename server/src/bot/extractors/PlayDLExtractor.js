const { BaseExtractor, Track, Playlist } = require('discord-player');
const play = require('play-dl');

class PlayDLExtractor extends BaseExtractor {
    static identifier = 'com.discord-player.playdlextractor';

    async validate(query, type) {
        // We validate mostly everything to act as a fallback
        // Or specifically validate Soundcloud/Youtube/Spotify links
        if (typeof query !== 'string') return false;
        return play.isValid_so_far(query);
    }

    async handle(query, context) {
        try {
            const validation = await play.validate(query);

            if (validation === 'yt_video') {
                const info = await play.video_info(query);
                const track = new Track(this.context.player, {
                    title: info.video_details.title,
                    description: info.video_details.description,
                    author: info.video_details.channel.name,
                    url: info.video_details.url,
                    thumbnail: info.video_details.thumbnails[0]?.url,
                    duration: info.video_details.durationInSec * 1000,
                    views: info.video_details.views,
                    requestedBy: context.requestedBy,
                    source: 'youtube',
                    queryType: context.type
                });
                // Attach internal bridge logic
                track.extractor = this;
                return { tracks: [track] };
            }

            if (validation === 'so_track') {
                const info = await play.soundcloud(query);
                const track = new Track(this.context.player, {
                    title: info.name,
                    description: info.description,
                    author: info.user.name,
                    url: info.url,
                    thumbnail: info.thumbnail,
                    duration: info.durationInMs,
                    views: info.playback_count,
                    requestedBy: context.requestedBy,
                    source: 'soundcloud',
                    queryType: context.type
                });
                track.extractor = this;
                return { tracks: [track] };
            }

            if (validation === 'search') {
                // Handle searches
                const results = await play.search(query, {
                    limit: 1,
                    source: { youtube: 'video' } // Prefer YT
                });

                if (!results || results.length === 0) return { tracks: [] };

                const tracks = results.map(info => new Track(this.context.player, {
                    title: info.title,
                    description: info.description,
                    author: info.channel?.name || info.author?.name,
                    url: info.url,
                    thumbnail: info.thumbnails?.[0]?.url,
                    duration: (info.durationInSec || 0) * 1000,
                    views: info.views,
                    requestedBy: context.requestedBy,
                    source: 'youtube',
                    queryType: context.type
                }));

                tracks.forEach(t => t.extractor = this);
                return { tracks };
            }

            // Fallback for other types playlist etc not implemented for brevity
            return { tracks: [] };

        } catch (error) {
            console.error('PlayDL Extractor Error:', error);
            return { tracks: [] };
        }
    }

    async stream(info) {
        const url = info.url;
        // Check source
        // For YouTube, we need specific handling
        // For SoundCloud, play-dl handles it

        try {
            console.log(`[PlayDL] Attempting to stream: ${url}`);
            const stream = await play.stream(url, {
                discordPlayerCompatibility: true
            });
            console.log(`[PlayDL] Stream created. Type: ${stream.type}`);
            return stream.stream;
        } catch (error) {
            console.error('PlayDL Stream Error:', error);
            throw error;
        }
    }
}

module.exports = PlayDLExtractor;
