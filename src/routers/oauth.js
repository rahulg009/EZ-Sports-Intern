// const passport = require('passport');
// const User = require('../models/user')


// var GoogleStrategy = require( 'passport-google-oauth20' ).Strategy;
// passport.serializeUser((user,done)=>{
//     done(null,user.id)
// })
// passport.deserializeUser((user,done)=>{
//     done(null,user)
// });


// passport.use(new GoogleStrategy({
//     clientID:     '1011574036991-mvs3o6arqub7cd9qcq7b5vfhhre98c4s.apps.googleusercontent.com',
//     clientSecret: '6eNIOXLbLxReyrMpft_1owDt',
//     callbackURL: "http://localhost:3000/google/callback",
//     passReqToCallback   : true
//   },(request, accessToken, refreshToken, profile, done) =>{
//     // User.findOrCreate({ googleId: profile.id }, function (err, user) {
//     // //   ;
//     // console.log(user)
//     // });
//     done(console.log("triggered"))
//     done(console.log(profile))
//     return done(err, user)
//   }
// ));

const passport = require('passport')
const GoogleStrategy=require('passport-google-oauth20').Strategy
const User = require('../models/user')
 
passport.initialize()
 
passport.use(new GoogleStrategy({
    clientID:     '1011574036991-mvs3o6arqub7cd9qcq7b5vfhhre98c4s.apps.googleusercontent.com',
    clientSecret: '6eNIOXLbLxReyrMpft_1owDt',
    callbackURL: "http://localhost:3000/google/callback"
  },
  (accessToken, refreshToken, profile, done)=>{
    User.findOne({googleId: profile.id}).then((currentUser)=>{
        if(currentUser){
          //if we already have a record with the given profile ID
          done(null, currentUser);
        } else{
             //if not, create a new user 
            new User({
              username:profile.emails[0].value.split('@')[0],
              firstName:profile.name.givenName,
              lastName:profile.name.familyName,
              email:profile.emails[0].value
            }).save().then((newUser) =>{
              done(null, newUser);
            });
         } 
      })
      console.log(profile.emails[0].value.split('@')[0]);

  }


));



