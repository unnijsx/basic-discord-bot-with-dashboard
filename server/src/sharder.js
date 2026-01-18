/**
 * Sharding Manager
 * Entry point for Production
 */
const { ShardingManager } = require('discord.js');
const path = require('path');
require('dotenv').config();

const manager = new ShardingManager(path.join(__dirname, '../index.js'), {
    token: process.env.DISCORD_BOT_TOKEN,
    totalShards: 'auto', // Automatically spawn needed shards
    respawn: true
});

manager.on('shardCreate', shard => {
    console.log(`[Manager] Launched Shard ${shard.id}`);
});

manager.spawn()
    .then(shards => {
        console.log(`[Manager] Spawned ${shards.size} shards.`);
    })
    .catch(console.error);
