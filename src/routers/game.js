require("dotenv").config();
const express = require("express");
const User = require("../models/user");
const Game = require("../models/game");
const Admin = require("../models/admin");
const Room = require("../models/room");
var passport = require("passport");
const adminauth = require("../middleware/adminauth");
const superadmin = require("../middleware/superadmin");
const router = new express.Router();
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
const twofactor = require("node-2fa");
const multer = require('multer');
const sharp = require('sharp');
require("./oauth");
require("./oauthfb");


const upload = multer({
  limits: {
      fileSize: 1000000
  },
  fileFilter(req, file, cb) {
      if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return cb(new Error('Please upload an image'))
      }

      cb(undefined, true)
  }
})

router.get("/game", (req, res) => {
  res.send("Game Page");
});



router.post("/game/add", adminauth,upload.single('logo'),async (req, res) => {
  const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
  try {
    const game = new Game({
      name: req.body.name,
      description: req.body.description,
      createdby: {
        id: req.user._id,
        username: req.user.username,
      },
      modifiedby: {
        id: req.user._id,
        username: req.user.username,
      },
      logo:buffer
    });
    await game.save();
    res.status(200).send(game);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.patch("/game/:id/edit", adminauth, async (req, res) => {
  try {
    const updateGame = {
      name: req.body.name,
      description: req.body.description,
      modifiedby: {
        id: req.user._id,
        username: req.user.username,
      },
    };
    await Game.findByIdAndUpdate(
      req.params.id,
      updateGame,
      (err, updatedGame, next) => {
        res.status(200).send(updateGame);
      }
    );
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.get("/game/viewall", function (req, res) {
  Game.find({}, (err, game) => {
    if (game) {
      res.send(game);
    } else {
      res.send("Empty");
    }
  });
});

router.get("/game/:id", async (req, res) =>{
  Game.findOne({ _id: req.params.id }, (err, game) => {
    // if (game) {
    //   res.send(game);
    // } else {
    //   res.send("Not found");
    // }
    if (!game || !game.logo) {
      throw new Error()
  }

  // res.set('Content-Type', 'image/png')
  res.send(game)
  });
});

// Room Routes

router.post("/game/room/:id", adminauth, async (req, res) => {
  try {
    Game.findOne({_id:req.params.id},async (err,game_exist)=>{
      if(game_exist){
        const room = new Room({
          room:req.body.room,
          game:{
            id:req.params.id,
            game_ty:game_exist.name
          },
          map:req.body.map,
          roommode:req.body.roommode,
          squadtype:req.body.squadtype,
          platform:req.body.platform,
          createdby: {
            id: req.user._id,
            username: req.user.username,
          },
          modifiedby: {
            id: req.user._id,
            username: req.user.username,
          }
        })
        await room.save()
        res.status(200).send(room)

      }else{
        res.send(err.message)
      }
    })

  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Update Route
module.exports = router;
