const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys = require('./keys');
const User = require('../models/user-model');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    });
});

passport.use(
    new GoogleStrategy({
        
        // options for google strategy
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret,
        callbackURL: '/auth/google/redirect'
    }, (accessToken, refreshToken, profile, done) => {
        console.log("inside 1");
        // check if user already exists in our own db
        User.findOne({googleId: profile.id}).then((currentUser) => {
            if(currentUser){
                console.log("inside 2");
                // already have this user
                console.log('user is: ', currentUser);
                done(null, currentUser);
            } else {
                console.log("inside 3");
                console.log(profile);
                // if not, create user in our db
                new User({
                    googleId: profile.id,
                    username: profile.displayName,
                    thumbnail: profile._json.picture
                }).save().then((newUser) => {
                    console.log("inside 4");
                    console.log('created new user: ', newUser);
                    done(null, newUser);
                });
            }
        });
    })
);
