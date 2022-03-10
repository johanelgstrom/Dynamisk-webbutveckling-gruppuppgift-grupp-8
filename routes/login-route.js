const express = require("express");
const utils = require("../utils.js");
const jwt = require("jsonwebtoken");
const router = express.Router();
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
    res.status(401).render("unauthorized");
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

router.get("/to-login", ifLoggedIn, (req, res) => {
  res.render("login/login");
});

//LOGGA IN
router.post("/posts", forceAuthorize, async (req, res) => {
  const { username, password } = req.body;
  const fullName = req.body.fullName;

  UsersModel.findOne({ username }, (err, user) => {
    if (user && utils.comparePassword(password, user.hashedPassword)) {
      //Login correct
      const userData = {
        userId: user._id,
        fullName: user.fullName,
        username,
      };

      const accessToken = jwt.sign(userData, process.env.JWTSECRET);
      console.log(user._id);
      res.cookie("token", accessToken);
      res.redirect("/posts");
    } else {
      res.render("unauthorized");
    }
  });
});

//!LOGGA IN

//LOGGA UT
router.get("/logout", (req, res) => {
  res.cookie("token", "", { maxAge: 0 });
  res.redirect("/");
});
//!LOGGA UT

//SKAPA KONTO

router.get("/create-account", ifLoggedIn, (req, res) => {
  res.render("login/create-account");
});

router.post("/register", async (req, res) => {
  const { fullName, username, password, confirmPassword } = req.body;

  // Kolla om man kan skapa en användare med samma användarnamn om man använder ett nytt fullName
  UsersModel.findOne({ username }, async (err, user) => {
    if (user) {
      res.send("Username already exists");
    } else if (password !== confirmPassword) {
      res.send("Password don't match");
    } else {
      const newUser = new UsersModel({
        fullName,
        username,
        hashedPassword: utils.hashedPassword(password),
      });

      await newUser.save();
      res.redirect("/");

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
    UsersModel.findOne({ googleId: req.user.id }, async (err, user) => {
      const userData = { displayName: req.user.displayName };

      if (user) {
        userData.userId = user._id;
        const accessToken = jwt.sign(userData, process.env.JWTSECRET);

        res.cookie("token", accessToken);
        res.redirect("/posts");
      } else {
        const newUser = new UsersModel({
          googleId: req.user.id,
          displayName: req.user.displayName,
          postedBy: userData,
        });
        const result = await newUser.save();
        userData.id = result._id;
        const accessToken = jwt.sign(userData, process.env.JWTSECRET);

        res.cookie("token", accessToken);
        res.redirect("/posts");
      }
    });
  }
);

router.get("/logout", (req, res) => {
  res.cookie("token", "", { maxAge: 0 });
  res.redirect("/");
});

//!GOOGLE LOGIN

module.exports = router;
