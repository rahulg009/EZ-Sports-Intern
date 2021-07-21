require("dotenv").config();
const express = require("express");
const User = require("../models/user");
const Game = require("../models/game");
const Admin = require("../models/admin");
var passport = require("passport");
const adminauth = require("../middleware/adminauth");
const superadmin = require("../middleware/superadmin");
const router = new express.Router();
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
const twofactor = require("node-2fa");
require("./oauth");
require("./oauthfb");

router.get("/game", (req, res) => {
  res.send("Game Page");
});

router.post("/game/add", adminauth, async (req, res) => {
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

router.get("/game/:id", async function (req, res) {
  Game.findOne({ _id: req.params.id }, (err, game) => {
    if (game) {
      res.send(game);
    } else {
      res.send("Not found");
    }
  });
});

module.exports = router;
