const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/model.user');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_REDIRECT_URI,
    accessType: 'offline',  // Request refresh token
    prompt: 'consent',       // Force consent screen to ensure refresh token
    scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let existingUser = await User.findOne({ 'google.id': profile.id });
        
        if (existingUser) {
            return done(null, existingUser);
        }

        const newUser = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            google: {
                id: profile.id,
                email: profile.emails[0].value
            }
        });

        await newUser.save();
        return done(null, newUser);
    } catch (error) {
        return done(error, null);
    }
}));

module.exports = passport;
