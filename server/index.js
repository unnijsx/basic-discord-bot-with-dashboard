const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
// Main Server Entry - Restored .env path
const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.set('trust proxy', 1); // Trust Vercel Proxy (Required for Secure Cookies)
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Socket.io Setup
const allowedOrigins = [
    'http://localhost:5173',
    'https://basic-discord-bot-with-dashboard.vercel.app'
];

// Socket.io Setup
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        credentials: true
    }
});

io.on('connection', (socket) => {
    // console.log('New client connected', socket.id);
    socket.on('joinGuild', (guildId) => {
        socket.join(guildId);
        // console.log(`Socket ${socket.id} joined guild ${guildId}`);
    });
});

// Discord Bot Setup
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates // Required for Music
    ]
});

// Middleware
app.use(express.json());
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(cookieParser());

// Inject Bot Client
// Inject Bot Client & Socket.io
app.use((req, res, next) => {
    req.botClient = client;
    req.io = io;
    next();
});

// Music Player Setup
const { Player } = require('discord-player');
const { DefaultExtractors } = require('@discord-player/extractor');

const player = new Player(client);
const PlayDLExtractor = require('./src/bot/extractors/PlayDLExtractor');

// Register extractors (YouTube, Spotify, etc.) and debug
(async () => {
    try {
        await player.extractors.register(PlayDLExtractor, {});
        console.log('✅ Play-DL Extractor registered');
    } catch (e) { console.log('Failed to register PlayDL:', e); }

    await player.extractors.loadMulti(DefaultExtractors);
    console.log('✅ Default Music Extractors loaded');
    // console.log(player.scanDeps()); // Uncomment if you need detailed dependency report
})();

// Debug Mode (Optional, uncomment if needed)
// player.events.on('debug', (queue, msg) => console.log(`[${queue.guild.name} DEBUG] ${msg}`));
// player.on('debug', msg => console.log(`[PLAYER DEBUG] ${msg}`));

// Player Events (Optional: Add more logs)
player.events.on('playerStart', (queue, track) => {
    queue.metadata.channel.send(`🎶 | Now playing **${track.title}**!`);
    io.to(queue.guild.id).emit('playerUpdate', { status: 'playing', track });
});

player.events.on('audioTrackAdd', (queue, track) => {
    io.to(queue.guild.id).emit('queueUpdate', { action: 'add', track });
});

player.events.on('playerPause', (queue) => {
    io.to(queue.guild.id).emit('playerUpdate', { status: 'paused' });
});

player.events.on('playerResume', (queue) => {
    io.to(queue.guild.id).emit('playerUpdate', { status: 'playing' });
});

player.events.on('error', (queue, error) => {
    console.log(`[${queue.guild.name}] Error emitted from the queue: ${error.message}`);
});

player.events.on('playerError', (queue, error) => {
    console.log(`[${queue.guild.name}] Player Error emitted from the queue: ${error.message}`);
});

// Load Bot Events and Commands
require('./src/bot/handler')(client);

// Initialize Scheduler
const scheduler = require('./src/utils/scheduler');

client.once('ready', () => {
    console.log(`🤖 Bot logged in as ${client.user.tag}`);
    scheduler.init(client);
});

// Session Setup
const session = require('express-session');
const MongoStore = require('connect-mongo').MongoStore;
const passport = require('passport');

app.use(session({
    secret: process.env.JWT_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    // MongoStore v4+ usage
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27017/discord-bot-platform' }),
    cookie: {
        secure: process.env.NODE_ENV === 'production', // true if https
        maxAge: 60000 * 60 * 24 * 7 // 1 week
    }
}));

// Passport Config
require('./src/strategies/discord');
app.use(passport.initialize());
app.use(passport.session());

// Routes
const authRoutes = require('./src/routes/auth');
const configRoutes = require('./src/routes/config');
const apiRoutes = require('./src/routes/api');
const musicRoutes = require('./src/routes/music');

app.use('/api/auth', authRoutes);
app.use('/api/config', configRoutes);
app.use('/api/modules', require('./src/routes/modules'));
app.use('/api/stats', require('./src/routes/analytics'));
app.use('/api/music', musicRoutes);
app.use('/api/admin', require('./src/routes/admin'));

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/discord-bot-platform')
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Basic API Route
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    res.send('Discord Bot Platform API is running');
});

// Start Server
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

// Start Bot (Only if token is present)
if (process.env.DISCORD_BOT_TOKEN) {
    client.login(process.env.DISCORD_BOT_TOKEN)
        .catch(err => console.error('❌ Bot Login Error:', err));
} else {
    console.log('⚠️ No Bot Token provided in .env');
}

// Export for other modules if needed
module.exports = { app, client };
