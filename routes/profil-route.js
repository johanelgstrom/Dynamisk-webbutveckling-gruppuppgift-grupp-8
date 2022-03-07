require("dotenv").config();
const express = require("express");
process.env.CONNECTION_STRING;

const postsModel = require("../models/postsModel");
const CommentsModel = require("../models/CommentsModel.js");
const UsersModel = require("../models/UsersModels.js");
const GoogleModel = require("../models/GoogleModels.js");
const { getUniqueFilename } = require("../utils");
const router = express.Router();
const fileupload = require("express-fileupload");
const jwt = require("jsonwebtoken");
process.env.CONNECTION_STRING;

const forceAuthorize = (req, res, next) => {
  const { token } = req.cookies;

  if (token && jwt.verify(token, process.env.JWTSECRET)) {
    next();
  } else {
    res.redirect("/");
  }
};

router.get("/", forceAuthorize, async (req, res) => {
  const user = await UsersModel.findById(req.params.id).lean();
  const googleUser = await GoogleModel.findById(req.params.id).lean();
  const articles = await postsModel
    .find({ postedBy: res.locals.userID })
    .sort([["time", "desc"]])
    .lean();

  res.render("profil", { googleUser, user, articles });
});

module.exports = router;
