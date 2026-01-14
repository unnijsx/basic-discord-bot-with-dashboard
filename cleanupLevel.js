const mongoose = require('mongoose');
const Level = require('./server/src/models/Level');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'server/.env') });

const guildId = '752506188922617907';

const cleanupData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/discord-bot-platform');
        console.log('Connected to DB');

        const fakeUserIds = ['123456789012345678', '987654321098765432', '112233445566778899'];

        await Level.deleteMany({ userId: { $in: fakeUserIds }, guildId });

        console.log('✅ Removed dummy users from Leaderboard');
        process.exit(0);
    } catch (err) {
        console.error('Cleanup Error:', err);
        process.exit(1);
    }
};

cleanupData();
