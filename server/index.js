const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Main Server Entry - Restored .env path
const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const util = require('util'); // For inspecting objects

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

// --- LIVE CONSOLE LOGS ---
const originalLog = console.log;
const originalError = console.error;

function broadcastLog(type, args) {
    try {
        // Convert args to string
        const message = args.map(arg => (typeof arg === 'string' ? arg : util.inspect(arg))).join(' ');
        io.to('admin-room').emit('server_log', { type, message, timestamp: new Date().toISOString() });
    } catch (e) { /* Ignore logging errors */ }
}

console.log = (...args) => {
    originalLog.apply(console, args);
    broadcastLog('info', args);
};

console.error = (...args) => {
    originalError.apply(console, args);
    broadcastLog('error', args);
};
// -------------------------

io.on('connection', (socket) => {
    // console.log('New client connected', socket.id);
    socket.join('admin-room'); // Auto join admins to log room
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
// Music Player Setup (Lavalink / Shoukaku)
const { Shoukaku } = require('shoukaku');
const { Nodes, ShoukakuOptions, Connector } = require('./src/utils/lavalinkClient');

// Initialize Shoukaku
console.log('⏳ [Lavalink] Initializing Client...');
const shoukaku = new Shoukaku(new Connector(client), Nodes, ShoukakuOptions);
client.shoukaku = shoukaku; // Attach to client for commands

shoukaku.on('error', (_, error) => console.error('❌ [Lavalink] Error:', error));
shoukaku.on('close', (name, code, reason) => console.warn(`⚠️ [Lavalink] Node ${name} closed: ${code} ${reason}`));
shoukaku.on('disconnect', (name, players, moved) => console.warn(`⚠️ [Lavalink] Node ${name} disconnected`));
shoukaku.on('ready', (name) => console.log(`✅ [Lavalink] Node ${name} is ready`));

// Inject Bot Client & Shoukaku
app.use((req, res, next) => {
    req.botClient = client;
    req.shoukaku = shoukaku;
    req.io = io; // Keep IO for live logs
    console.log(`[HTTP] ${req.method} ${req.url}`);
    next();
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
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/discord-bot-platform', { family: 4 })
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Basic API Route
app.use('/api', apiRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

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
