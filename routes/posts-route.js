require("dotenv").config();
const express = require("express");
process.env.CONNECTION_STRING;

const postsModel = require("../models/postsModel");
const CommentsModel = require("../models/CommentsModel.js");
const UsersModel = require("../models/UsersModels.js");
const { getUniqueFilename } = require("../utils");
const router = express.Router();
const fileupload = require("express-fileupload");
const jwt = require("jsonwebtoken");

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

router.get("/new-post", forceAuthorize, (req, res) => {
  res.render("new-post");
});

router.post("/new-post", forceAuthorize, async (req, res) => {
  const image = req.files.image;
  const filename = getUniqueFilename(image.name);
  const uploadpath = __dirname + "/../public/uploads/" + filename;

  await image.mv(uploadpath);
  if (res.locals.fullName) {
    const newArticle = new postsModel({
      author: res.locals.user,
      postedBy: res.locals.userID,
      title: req.body.title,
      imageName: req.body.imageName,
      imgUrl: "/uploads/" + filename,
      country: req.body.country,
    });

    const result = await newArticle.save();
    res.redirect("read-post/" + result._id);
    // console.log(newArticle);
  } else {
    const newArticle = new postsModel({
      author: res.locals.user,
      postedBy: res.locals.userID,
      title: req.body.title,
      imageName: req.body.imageName,
      imgUrl: "/uploads/" + filename,
      country: req.body.country,
    });

    const result = await newArticle.save();
    res.redirect("read-post/" + result._id);
    // console.log(newArticle);
  }
});

router.get("/read-post/:id", forceAuthorize, async (req, res) => {
  const article = await postsModel.findById(req.params.id).lean();
  res.render("read-post", article);
});

router.post("/:id/comment", forceAuthorize, async (req, res) => {
  const post = await postsModel.findById(req.params.id).lean();
  // console.log(res.locals);
  if (res.locals.fullName) {
    const newComment = new CommentsModel({
      author: res.locals.fullName,
      postId: req.params.id,
      description: req.body.comment,
      time: Date.now(),
      likes: [],
    });
    await newComment.save();
    await postsModel.updateOne(
      { _id: req.params.id },
      { $push: { comments: newComment } }
    );
  } else {
    const newComment = new CommentsModel({
      author: res.locals.loginInfo,
      postId: req.params.id,
      description: req.body.comment,
      time: Date.now(),
      likes: [],
    });
    await newComment.save();
    await postsModel.updateOne(
      { _id: req.params.id },
      { $push: { comments: newComment } }
    );
  }

  res.redirect("/posts");
});
router.post("/read-post/:id/comment", forceAuthorize, async (req, res) => {
  const post = await postsModel.findById(req.params.id).lean();
  if (res.locals.fullName) {
    const newComment = new CommentsModel({
      author: res.locals.fullName,
      postId: req.params.id,
      description: req.body.comment,
      time: Date.now(),
      likes: [],
    });
    await postsModel.updateOne(
      { _id: req.params.id },
      { $push: { comments: newComment } }
    );
    await newComment.save();
  } else {
    // console.log(res.locals);
    const newComment = new CommentsModel({
      author: res.locals.loginInfo,
      postId: req.params.id,
      description: req.body.comment,
      time: Date.now(),
      likes: [],
    });
    await postsModel.updateOne(
      { _id: req.params.id },
      { $push: { comments: newComment } }
    );
    await newComment.save();
  }

  res.redirect(`/posts/read-post/${req.params.id}`);
});

module.exports = router;

// router.get("/", async (req, res) => {
//   const articles = await postsModel
//     .find()
//     .sort([["time", "desc"]])
//     .lean();
//   res.render("posts", { articles });
// });

// router.get("/seed-data", async (req, res) => {
//   const newArticle = new postsModel({
//     title: "myfirst post",
//     content: "this is my first post",
//   });

//   await newArticle.save();

//   res.sendStatus(200);
// });

// router.get("/new-post", (req, res) => {
//   res.render("new-post");
// });

// router.post("/new-post", async (req, res) => {
//   const image = req.files.image;
//   const filename = getUniqueFilename(image.name);
//   const uploadpath = __dirname + "/../public/uploads/" + filename;

//   await image.mv(uploadpath);

//   const newArticle = new postsModel({
//     title: req.body.title,
//     time: Date.now(),
//     content: req.body.content,
//     imageName: req.body.imageName,
//     imgUrl: "/uploads/" + filename,
//   });

//   const result = await newArticle.save();
//   res.redirect("read-post/" + result._id);
// });

// router.get("/:id/delete", async (req, res) => {
//   const article = await postsModel.findById(req.params.id).lean();

//   res.render("delete-post", article);
// });

// router.post("/:id/delete", async (req, res) => {
//   const id = req.params.id;

//   const article = await postsModel.findById(req.params.id).lean();

//   await postsModel.deleteOne({ _id: id });

//   res.redirect("/posts");
// });

// router.get("/:id/edit", async (req, res) => {
//   const article = await postsModel.findById(req.params.id).lean();
//   res.render("edit-post", article);
// });

// router.get("/:id/edit", async (req, res) => {
//   const id = req.params.id;
//   const image = req.files.image;
//   const filename = getUniqueFilename(image.name);
//   const uploadpath = __dirname + "/../public/uploads/" + filename;

//   await image.mv(uploadpath);

//   const article = await postsModel.updateOne(
//     { _id: id },
//     {
//       $set: {
//         title: req.body.title,
//         imageName: req.body.imageName,
//         imgUrl: "/uploads/" + filename,
//         content: req.body.content,
//       },
//     }
//   );

//   res.sendStatus(200);
// });

// router.get("/read-post/:id", async (req, res) => {
//   const article = await postsModel.findById(req.params.id).lean();
//   res.render("read-post", article);
// });

// router.post('/:id/comment', async (req,res) => {
//     const post = await postsModel.findById(req.params.id).lean()
//     if(res.locals.displayName) {
//       const newComment = new CommentsModel({
//         author: res.locals.displayName,
//         postId: req.params.id,
//         description: req.body.comment,
//         time: Date.now(),
//         likes: []
//     })
//     await newComment.save()
//     await postsModel.updateOne({_id: req.params.id}, { $push: {comments: newComment}})
//     }
//     else {
//       const newComment = new CommentsModel({
//         author: res.locals.fullName,
//         postId: req.params.id,
//         description: req.body.comment,
//         time: Date.now(),
//         likes: []
//     })
//     await newComment.save()
//     await postsModel.updateOne({_id: req.params.id}, { $push: {comments: newComment}})
//     }

//     res.redirect('/posts')
// })
// router.post('/read-post/:id/comment', async (req,res) => {
//     const post = await postsModel.findById(req.params.id).lean()
//     if(res.locals.fullName) {
//       const newComment = new CommentsModel({
//         author: res.locals.fullName,
//         postId: req.params.id,
//         description: req.body.comment,
//         time: Date.now(),
//         likes: []
//     })
//     await postsModel.updateOne({_id: req.params.id}, { $push: {comments: newComment}})
//     await newComment.save()
//     }
//     else {
//       console.log(res.locals);
//       const newComment = new CommentsModel({
//         author: res.locals.loginInfo,
//         postId: req.params.id,
//         description: req.body.comment,
//         time: Date.now(),
//         likes: []
//     })
//     await postsModel.updateOne({_id: req.params.id}, { $push: {comments: newComment}})
//     await newComment.save()
//     }

//     res.redirect(`/posts/read-post/${req.params.id}`)
// })

// module.exports = router;
