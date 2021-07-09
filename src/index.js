require('dotenv').config()
const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
var passport    = require("passport")
var User        = require("./models/user")
var LocalStrategy = require("passport-local")


const app = express()
const port = process.env.PORT || 3000


app.use(express.json())

// app.use(require('body-parser').urlencoded({ extended: true }));

// Passport config
app.use(require("express-session")({
    secret: "abcd",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(userRouter)

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})

