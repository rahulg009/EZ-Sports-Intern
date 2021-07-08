const express = require("express");
const User = require("../models/user");
var passport = require("passport");
const auth = require("../middleware/auth");
const router = new express.Router();
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
require("./oauth");
require("./oauthfb");

router.get("/", function (req, res) {
  res.send("user Logged");
});

router.post("/register", function (req, res) {
  console.log(req.body);
  var newUser = new User({
    username: req.body.username,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    ph: req.body.ph,
  });
  User.register(newUser, req.body.password, function (err, user) {
    if (err) {
      console.log(err);
      res.status(400).send(err.message);
    }
    passport.authenticate("local")(req, res, function () {
      res.status(200).send(newUser);
    });
  });
});

//handling login logic
router.post("/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/failure",
  }),
  function (err, req, res) {
    res.status(400).send(res);
    console.log(err);
  }
);

// logout route
router.get("/user/logout", function (req, res) {
  req.logout();
  res.status(200).send("logged out");
});

router.get("/user/about", auth, async function (req, res) {
  try {
    if (req.isAuthenticated()) {
      res.send(req.user);
    }
  } catch {
    res.send("please login");
  }
});
// user edit
router.patch("/user/edit", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["firstName", "lastName", "ph", "email", "password"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
    console.log(e);
  }
});

router.patch("/user/changePassword", auth, async (req, res) => {
  User.findOne(
    {
      username:req.user.username,
    },
    function (err, user) {
      if (!user) {
      //   return res.redirect("back");
      return res.send("invalid")
      }
      if (req.body.password === req.body.confirm) {
        user.setPassword(req.body.password, function (err) {
          user.save(function (err) {
            res.send("Password Changed")
          });
        });
      } else {
      return res.send("password do not match")
      }
    }
  );
});
// user delete
router.delete("/user/remove", auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});

router.get('/failure',function(req,res){
    res.send("Failed")
})
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
router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    successRedirect: "/user/about",
  }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);

// Facebook Auth
router.get("/facebook", passport.authenticate("facebook"));

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { successRedirect: "/user/about", failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);

//forgot password
router.get("/forgot", function (req, res) {
//   res.render("forgot");
    res.send("Forget")
});

router.post("/forgot", function (req, res, next) {
  async.waterfall(
    [
      function (done) {
        crypto.randomBytes(20, function (err, buf) {
          var token = buf.toString("hex");
          done(err, token);
        });
      },
      function (token, done) {
        User.findOne({ email: req.body.email }, function (err, user) {
          if (!user) {
            // req.flash("error", "No account with that email address exists.");
            // return res.redirect("/forgot");
            res.status(400).send("No account with that email address exists.")
          }

          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000;

          user.save(function (err) {
            done(err, token, user);
          });
        });
      },
      function (token, user, done) {
        console.log(user.email)
        var smtpTransport = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: "coolranjanayush@gmail.com",
            pass: process.env.GMAILPW,
          },
        });
        var mailOptions = {
          to: user.email,
          from: "coolranjanayush@gmail.com",
          subject: "Esports Password Reset",
          text:
            "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
            "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
            "http://" +
            req.headers.host +
            "/reset/" +
            token +
            "\n\n" +
            "If you did not request this, please ignore this email and your password will remain unchanged.\n",
        };
        smtpTransport.sendMail(mailOptions, function (err) {
          console.log("mail sent");
          // req.flash(
          //   "success",
          //   "An e-mail has been sent to " +
          //     user.email +
          //     " with further instructions."
          // );
          done(err, "done");
        });
      },
    ],
    function (err) {
      if (err) return next(err);
    //   res.redirect("/forgot");
        res.send("redirected")
    }
  );
});

router.get("/reset/:token", function (req, res) {
  User.findOne(
    {
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    },
    function (err, user) {
      if (!user) {
        req.flash("error", "Password reset token is invalid or has expired.");
        return res.status(400).send("no user");
      }
    //   res.render("reset", { token: req.params.token });
    }
  );
});

router.post("/reset/:token", function (req, res) {
  async.waterfall(
    [
      function (done) {
        User.findOne(
          {
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() },
          },
          function (err, user) {
            if (!user) {
              req.flash(
                "error",
                "Password reset token is invalid or has expired."
              );
            //   return res.redirect("back");
            return res.send("invalid")
            }
            if (req.body.password === req.body.confirm) {
              user.setPassword(req.body.password, function (err) {
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;

                user.save(function (err) {
                  req.logIn(user, function (err) {
                    done(err, user);
                  });
                });
              });
            } else {
              // req.flash("error", "Passwords do not match.");
            //   return res.redirect("back");
            return res.send("password do not match")
            }
          }
        );
      },
      function (user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: "coolranjanayush@gmail.com",
            pass: process.env.GMAILPW,
          },
        });
        var mailOptions = {
          to: user.email,
          from: "coolranjanayush@gmail.com",
          subject: "Your password has been changed",
          text:
            "Hello,\n\n" +
            "This is a confirmation that the password for your account " +
            user.email +
            " has just been changed.\n",
        };
        smtpTransport.sendMail(mailOptions, function (err) {
        //   req.flash("success", "Success! Your password has been changed.");
          done(err);
        });
      },
    ],
    function (err) {
    res.send()
    }
  );
});

module.exports = router;
