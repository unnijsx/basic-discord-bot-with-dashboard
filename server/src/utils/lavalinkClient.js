const { Connectors } = require('shoukaku');

const Nodes = [
    {
        name: 'Public-Raiden',
        url: 'node.raiden.gg:5500',
        auth: 'everyone',
        secure: false
    },
    {
        name: 'Public-LavalinkDE',
        url: 'lavalink.kulwinder.de:443',
        auth: 'kulwinder',
        secure: true
    },
    {
        name: 'Public-Ajie',
        url: 'lavalink.ajieblogs.eu.org:443',
        auth: 'https://ajieblogs.eu.org',
        secure: true
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
