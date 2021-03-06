require("dotenv").config();

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GoogleModel = require("./models/GoogleModels.js");
const jwt = require("jsonwebtoken");

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8000/google/callback",
      passReqToCallback: true,
    },

    function (request, accessToken, refreshToken, profile, done) {
      return done(null, profile);
    }
  )
);
