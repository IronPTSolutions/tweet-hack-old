const passport = require('passport');
const User = require('../models/user.model');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const FBStrategy = require('passport-facebook').Strategy;

passport.use('google-auth', new GoogleStrategy({
  clientID: process.env.GOOGLE_AUTH_CLIENT_ID,
  clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_AUTH_CB || '/callback/google',
}, authenticateOAuthUser));

passport.use('facebook-auth', new FBStrategy({
  clientID: process.env.FB_AUTH_CLIENT_ID,
  clientSecret: process.env.FB_AUTH_CLIENT_SECRET,
  callbackURL: process.env.FB_AUTH_CB || '/callback/facebook',
  profileFields: ['displayName', 'emails']
}, authenticateOAuthUser));

function authenticateOAuthUser(accessToken, refreshToken, profile, next) {
  User.findOne({ [`social.${profile.provider}`]: profile.id })
    .then(user => {
      if (user) {
        next(null, user);
      } else {
        user = new User({
          name: profile.displayName,
          avatar: profile._json.picture,
          username: profile.displayName.replace(/\s/g, ''),
          email: profile.emails[0].value,
          validated: true,
          password: profile.provider + Math.random().toString(36).substring(7),
          social: {
            [profile.provider]: profile.id
          }
        })
        return user.save()
          .then(user => {
            next(null, user);
          });
      }
    })
    .catch(error => next(error));
}


module.exports = passport.initialize()