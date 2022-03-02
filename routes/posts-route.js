require("dotenv").config();
const express = require("express");
process.env.CONNECTION_STRING;

const postsModel = require("../models/postsModel");
const router = express.Router();

const forceAuthorize = (req, res, next) => {
  const { token } = req.cookies;

  if (token && jwt.verify(token, process.env.JWTSECRET)) {
    next();
  } else {
    res.redirect("/");
  }
};

router.get("/", forceAuthorize, async (req, res) => {
  const articles = await postsModel
    .find()
    .sort([["time", "desc"]])
    .lean();
  res.render("posts", { articles });
});

router.get("/seed-data", forceAuthorize, async (req, res) => {
  const newArticle = new postsModel({
    title: "myfirst post",
    content: "this is my first post",
  });

  await newArticle.save();

  res.sendStatus(200);
});

router.get("/new-post", forceAuthorize, (req, res) => {
  res.render("new-post");
});

router.post("/new-post", forceAuthorize, async (req, res) => {
  const newArticle = new postsModel(req.body);

  const result = await newArticle.save();
  res.redirect("read-post/" + result._id);
});

router.get("/read-post/:id", forceAuthorize, async (req, res) => {
  const article = await postsModel.findById(req.params.id).lean();
  res.render("read-post", article);
});

module.exports = router;
