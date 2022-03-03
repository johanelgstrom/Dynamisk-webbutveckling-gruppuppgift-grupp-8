const express = require("express");
const utils = require("../utils.js");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { ObjectId } = require("mongodb");
const UsersModel = require("../models/UsersModels.js");
const postsModel = require("../models/postsModel");
const GoogleModel = require("../models/GoogleModels");
const passport = require("passport");

//Om man inte är inloggad

const forceAuthorize = (req, res, next) => {
  const { username, password } = req.body;
  const { token } = req.cookies;

  if (
    (token && jwt.verify(token, process.env.JWTSECRET)) ||
    (username && password)
  ) {
    next();
  } else {
    res.redirect("/");
  }
};
//!Om man inte är inloggad

//Om man är inloggad
const ifLoggedIn = async (req, res, next) => {
  const { username, password } = req.body;
  const { token } = req.cookies;
  const articles = await postsModel
    .find()
    .sort([["time", "desc"]])
    .lean();

  if (
    (token && jwt.verify(token, process.env.JWTSECRET)) ||
    (username && password)
  ) {
    res.render("posts", { username, articles, token });
  } else {
    next();
  }
};

//!Om man är inloggad

router.get("/", ifLoggedIn, (req, res) => {
  res.render("home");
});

//LOGGA IN
router.post("/posts", forceAuthorize, async (req, res) => {
  const { username, password } = req.body;
  const { token } = req.cookies;
  const articles = await postsModel
    .find()
    .sort([["time", "desc"]])
    .lean();

  UsersModel.findOne({ username }, (err, user) => {
    if (user && utils.comparePassword(password, user.hashedPassword)) {
      //Login correct
      const userData = {
        userId: user._id,
        username,
      };

      const accessToken = jwt.sign(userData, process.env.JWTSECRET);

      res.cookie("token", accessToken);
      res.render("posts", { username, articles, token });
    } else {
      res.render("home");
    }
  });
});

//!LOGGA IN

//LOGGA UT
router.get("/logout", (req, res) => {
  res.cookie("token", "", { maxAge: 1 });
  res.redirect("/");
});
//!LOGGA UT

//SKAPA KONTO

router.get("/create-account", ifLoggedIn, (req, res) => {
  res.render("login/create-account");
});

router.post("/register", async (req, res) => {
  const { username, password, secret, confirmPassword } = req.body;
  const { token } = req.cookies;
  const articles = await postsModel
    .find()
    .sort([["time", "desc"]])
    .lean();

  UsersModel.findOne({ username }, async (err, user) => {
    if (user) {
      res.send("Username already exists");
    } else if (password !== confirmPassword) {
      res.send("Password don't match");
    } else {
      const newUser = new UsersModel({
        username,
        hashedPassword: utils.hashedPassword(password),
        // secret,
      });

      await newUser.save();
      res.render("posts", { username, articles, token });
      //   res.sendStatus(200);
    }
  });
});
//!SKAPA KONTO

//GOOGLE LOGIN
router.get("/failed", (req, res) => {
  res.send("Failed");
});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/failed" }),
  async (req, res) => {
    const { token } = req.cookies;
    const articles = await postsModel
      .find()
      .sort([["time", "desc"]])
      .lean();
    GoogleModel.findOne({ googleId: req.user.id }, async (err, user) => {
      const userData = { displayName: req.user.displayName };

      if (user) {
        userData.id = user._id;
      } else {
        const newUser = new GoogleModel({
          googleId: req.user.id,
          displayName: req.user.displayName,
        });
        const result = await newUser.save();
        userData.id = result._id;
      }

      const accessToken = jwt.sign(userData, process.env.JWTSECRET);
      const displayName = userData.displayName;
      // console.log(user);
      res.cookie("token", accessToken);
      res.render("posts", { displayName, articles, token });
    });
  }
);

router.use((req, res, next) => {
  const { token } = req.cookies;

  if (token && jwt.verify(token, process.env.JWTSECRET)) {
    const tokenData = jwt.decode(token, process.env.JWTSECRET);
    res.locals.loginInfo = tokenData.displayName + " " + tokenData.id;
  } else {
    res.locals.loginInfo = "not logged in";
  }

  next();
});

router.get("/logout", (req, res) => {
  res.cookie("token", "", { maxAge: 0 });
  res.redirect("/");
});

//!GOOGLE LOGIN

module.exports = router;
