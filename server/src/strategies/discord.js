const DiscordStrategy = require('passport-discord').Strategy;
const passport = require('passport');
const User = require('../models/User');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        if (user) done(null, user);
    } catch (err) {
        done(err, null);
    }
});

passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_REDIRECT_URI,
    scope: ['identify', 'email', 'guilds']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ discordId: profile.id });
        if (user) {
            user.accessToken = accessToken;
            user.refreshToken = refreshToken;
            user.avatar = profile.avatar;
            user.username = profile.username;
            user.discriminator = profile.discriminator;
            await user.save();
            return done(null, user);
        }

        const newUser = new User({
            discordId: profile.id,
            username: profile.username,
            discriminator: profile.discriminator,
            avatar: profile.avatar,
            accessToken: accessToken,
            refreshToken: refreshToken,
            guilds: [] // We can fetch guilds later or here
        });

        await newUser.save();
        return done(null, newUser);
    } catch (err) {
        console.error(err);
        return done(err, null);
    }
}));
