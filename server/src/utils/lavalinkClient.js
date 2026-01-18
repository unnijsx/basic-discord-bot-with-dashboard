const { Connectors } = require('shoukaku');

const Nodes = [
    {
        name: 'Jirayu-SSL',
        url: 'lavalink.jirayu.net:443',
        auth: 'youshallnotpass',
        secure: true
    },
    {
        name: 'Serenetia-v4',
        url: 'lavalinkv4.serenetia.com:443',
        auth: 'https://dsc.gg/ajidevserver',
        secure: true
    },
    {
        name: 'Jirayu-NonSSL',
        url: 'lavalink.jirayu.net:13592',
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
