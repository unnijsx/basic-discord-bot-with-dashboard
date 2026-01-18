const ffmpeg = require('ffmpeg-static');

if (ffmpeg) {
    process.env.FFMPEG_PATH = ffmpeg;
    console.log(`✅ [FFmpeg] Path explicit set to: ${ffmpeg}`);
} else {
    console.error('❌ [FFmpeg] ffmpeg-static not found! Music might fail.');
}
