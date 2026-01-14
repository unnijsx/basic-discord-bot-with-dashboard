const mongoose = require('mongoose');
const Level = require('./server/src/models/Level');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'server/.env') });

const guildId = '752506188922617907'; // User's guild ID from context

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/discord-bot-platform');
        console.log('Connected to DB');

        const testUsers = [
            { userId: '123456789012345678', xp: 1500, level: 5 },
            { userId: '987654321098765432', xp: 800, level: 3 },
            { userId: '112233445566778899', xp: 300, level: 1 }
        ];

        for (const user of testUsers) {
            await Level.findOneAndUpdate(
                { userId: user.userId, guildId },
                { $set: { xp: user.xp, level: user.level, lastXp: new Date() } },
                { upsert: true, new: true }
            );
        }

        console.log('✅ Seeded 3 test users for Leaderboard');
        process.exit(0);
    } catch (err) {
        console.error('Seed Error:', err);
        process.exit(1);
    }
};

seedData();
