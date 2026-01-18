const ffmpeg = require('ffmpeg-static');
const { spawnSync } = require('child_process');

if (ffmpeg) {
    process.env.FFMPEG_PATH = ffmpeg;
    console.log(`✅ [FFmpeg] Path set to: ${ffmpeg}`);

    // Validate execution
    try {
        const result = spawnSync(ffmpeg, ['-version'], { encoding: 'utf-8' });
        if (result.error) {
            console.error('❌ [FFmpeg] Binary check failed:', result.error);
        } else {
            console.log('✅ [FFmpeg] Binary working:', result.stdout.split('\n')[0]);
        }
    } catch (e) {
        console.error('❌ [FFmpeg] Execution exception:', e);
    }
} else {
    console.error('❌ [FFmpeg] ffmpeg-static not found! Music might fail.');
}
