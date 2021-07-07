const express = require('express')
const User = require('../models/user')
var passport = require("passport");
const auth = require('../middleware/auth')
const router = new express.Router()
require('./oauth')
require('./oauthfb')




router.get("/",function(req,res){
    res.send("user Logged")
})

router.post("/register", function(req, res){
    console.log(req.body)
    var newUser = new User(
		{
			username: req.body.username,
			firstName:req.body.firstName,
			lastName:req.body.lastName,
			email:req.body.email,
            ph:req.body.ph
		}
	);
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            res.status(400).send(err.message)
        }
        passport.authenticate("local")(req, res, function(){
            res.status(200).send(newUser)
        });
    });
});

//handling login logic
router.post("/login", passport.authenticate("local", 
    {
        
        successRedirect: "/",
        failureRedirect: "/login",
    }), function(err,req, res){
        
        res.status(400).send(res)
        console.log(err)
        
});

// logout route
router.get("/user/logout", function(req, res){
   req.logout();
   res.status(200).send("logged out")
});

router.get("/user/about",auth,async function(req,res){
    try{
        if(req.isAuthenticated()){
            res.send(req.user)
        }
    }
    catch{
        res.send("please login")
    }
    
})

router.patch('/users/edit', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['firstName','lastName','ph','email','password']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
        console.log(e)
    }
})

router.delete('/users/remove', auth, async (req, res) => {
    try {
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

// router.get('/failure',function(req,res){
//     res.send("Failed")
// })
// router.get('/google/callback',function(req,res){
//     res.send("Oauth Done")
//     console.log()
// })
// router.get('/google',
//   passport.authenticate('google', { scope:
//       ['profile' ] }
// ));

// router.get( '/auth/google/callback',
//     passport.authenticate( 'google', {
//         successRedirect: '/user/about',
//         failureRedirect: '/failure'
// }));
// Google Auth
router.get('/google',
  passport.authenticate('google', { scope: ['email','profile'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login',successRedirect: '/user/about' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

// Facebook Auth
router.get('/facebook',
  passport.authenticate('facebook'));

router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

module.exports = router