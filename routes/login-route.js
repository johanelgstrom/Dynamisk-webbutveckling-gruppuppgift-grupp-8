const express = require("express");
const utils = require("../utils.js");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { ObjectId } = require("mongodb");
const UsersModel = require("../models/UsersModels.js");

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

module.exports = router;
