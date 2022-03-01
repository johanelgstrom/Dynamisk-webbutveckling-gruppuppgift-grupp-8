const express = require("express");
const utils = require("../utils.js");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { ObjectId } = require("mongodb");
const UsersModel = require("../models/UsersModels.js");
const postsModel = require("../models/postsModel");

router.get("/", async (req, res) => {
  res.render("home");
});

//LOGGA IN
router.post("/posts", async (req, res) => {
  const { username, password } = req.body;
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
      res.render("posts", { username, articles });
    } else {
      res.send("Login failed");
    }
  });
});

//!LOGGA IN

//SKAPA KONTO

router.get("/create-account", (req, res) => {
  res.render("login/create-account");
});

router.post("/register", async (req, res) => {
  const { username, password, secret, confirmPassword } = req.body;

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
      res.render("posts", { username });
      //   res.sendStatus(200);
    }
  });
});
//!SKAPA KONTO

module.exports = router;
