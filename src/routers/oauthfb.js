const FacebookStrategy = require('passport-facebook')
var passport = require("passport");
const User = require('../models/user')

passport.use(new FacebookStrategy({
    clientID: '274519854450774',
    clientSecret: 'ef55d2cab6997e971ada1134ad96db69',
    callbackURL: "http://localhost:3000/facebook/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOne({username: profile.id}).then((currentUser)=>{
        if(currentUser){
          //if we already have a record with the given profile ID
          done(null, currentUser);
        } else{
             //if not, create a new user 
            new User({
              username:profile.displayName,
              firstName:profile.displayName.split(' ')[0],
              lastName:profile.displayName.split(' ')[1],
              
            }).save().then((newUser) =>{
              done(null, newUser);
            });
         } 
      })
   
  }
));