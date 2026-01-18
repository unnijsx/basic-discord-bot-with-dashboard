const { Connectors } = require('shoukaku');

const Nodes = [
    {
        name: 'Public Node 1',
        url: 'node.raiden.gg:5500', // Example public node, can be replaced via ENV
        auth: 'everyone',
        secure: false
    },
    {
        name: 'Public Node 2',
        url: 'lavalink.myracloud.com:2333',
        auth: 'youshallnotpass',
        secure: false
    }
];

// Allow override via ENV
if (process.env.LAVALINK_HOST) {
    Nodes.unshift({
        name: 'Private Node',
        url: process.env.LAVALINK_HOST,
        auth: process.env.LAVALINK_PASSWORD || 'youshallnotpass',
        secure: process.env.LAVALINK_SECURE === 'true'
    });
}

const ShoukakuOptions = {
    moveOnDisconnect: false,
    resume: false,
    reconnectTries: 5,
    restTimeout: 10000
};

module.exports = { Nodes, ShoukakuOptions, Connector: Connectors.DiscordJS };
