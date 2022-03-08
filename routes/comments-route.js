const mongoose = require('mongoose')
const express = require("express");
const utils = require("../utils.js");
const CommentsModel = require("../models/CommentsModel.js");
const jwt = require("jsonwebtoken");
const postsModel = require("../models/postsModel.js");
const { sendStatus } = require('express/lib/response');
const router = express.Router();

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
    res.render('unauthorized')
  }
};
//!Om man inte är inloggad

router.get('/', forceAuthorize, async (req,res) => {
    const comments = await CommentsModel.find().lean()
    
    res.render('comments/comments-list', {comments})
})

router.get('/:id', forceAuthorize, async (req,res) => {
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.render('not-found')
        return
    }
    const doesIdExist = await CommentsModel.exists({ _id: req.params.id });
    if(doesIdExist === null) {
        res.render('not-found')
        return
    }
    const comment = await CommentsModel.findById(req.params.id).lean()
    let result = false
    let validAuthor = false
    if(res.locals.fullName) {
        result = await utils.checkIfLiked(res.locals.fullName, req.params.id, CommentsModel)
        validAuthor = await utils.checkAuthorUsername(res.locals.fullName, comment.author)
    }
    else {
        result = await utils.checkIfLiked(res.locals.loginInfo, req.params.id, CommentsModel)
        validAuthor = await utils.checkAuthorUsername(res.locals.loginInfo, comment.author)
    }
    // console.log(res.locals);
    // console.log(result);
    // console.log(validAuthor);
    
    if(validAuthor === true) {
        if (result == true) {
            
            res.render('comments/comment-single', {comment, result, validAuthor})
        }
        else {
            
            res.render('comments/comment-single', {comment, validAuthor})
        }
    }
    else {
        if (result == true) {
            
            res.render('comments/comment-single', {comment, result})
        }
        else {
            
            res.render('comments/comment-single', {comment})
        }
    }
})

router.get('/:id/like', forceAuthorize, async (req,res) => {
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.render('not-found')
        return
    }
    const doesIdExist = await CommentsModel.exists({ _id: req.params.id });
    if(doesIdExist === null) {
        res.render('not-found')
        return
    }
    const comment = await CommentsModel.findById(req.params.id).lean()
    if(res.locals.fullName) {
        const user = res.locals.fullName
        await CommentsModel.updateOne({_id: req.params.id}, { $push: {likes: res.locals.fullName}})
        await postsModel.updateOne({_id: comment.postId, "comments.description": `${comment.description}`}, { $push: {"comments.$.likes": user} }).lean()
    }
    else {
        const user = res.locals.loginInfo
        await CommentsModel.updateOne({_id: req.params.id}, { $push: {likes: res.locals.loginInfo}})
        await postsModel.updateOne({_id: comment.postId, "comments.description": `${comment.description}`}, { $push: {"comments.$.likes": user} }).lean()
    }
    
    res.redirect(`/comments/${req.params.id}`)
})

router.get('/:id/unlike', forceAuthorize, async (req,res) => {
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.render('not-found')
        return
    }
    const doesIdExist = await CommentsModel.exists({ _id: req.params.id });
    if(doesIdExist === null) {
        res.render('not-found')
        return
    }
    const comment = await CommentsModel.findById(req.params.id).lean()
    const post = await postsModel.findById(comment.postId).lean()

    console.log(post.comments.length);
    
    if(res.locals.fullName) {
        const user = res.locals.fullName
            for (let i = 0; i < comment.likes.length; i++) {

                if(comment.likes[i] === res.locals.fullName) {
                    const result = await utils.checkAuthorUsername(res.locals.fullName, comment.likes[i])
                    if(result === true) {
                        await CommentsModel.updateOne({_id: req.params.id}, { $pull: {likes: res.locals.fullName}})
                    res.redirect(`/comments/${req.params.id}`)
                    }
                    
                }
            }
            for (let i = 0; i < post.comments.length; i++) {
                    await postsModel.updateOne({_id: comment.postId, "comments.description": `${comment.description}`}, { $pull: {"comments.$.likes": user} }).lean()    
            }
            
    
    }
    else {
        const user = res.locals.loginInfo
            for (let i = 0; i < comment.likes.length; i++) {

                if(comment.likes[i] === res.locals.loginInfo) {
                    const result = await utils.checkAuthorUsername(res.locals.loginInfo, comment.likes[i])
                    if(result === true) {
                        await CommentsModel.updateOne({_id: req.params.id}, { $pull: {likes: res.locals.loginInfo}})
                    res.redirect(`/comments/${req.params.id}`)
                    }
                    
                }
            }
            for (let i = 0; i < post.comments.length; i++) {
                    await postsModel.updateOne({_id: comment.postId, "comments.description": `${comment.description}`}, { $pull: {"comments.$.likes": user} }).lean()    
            }
    }
})

router.get('/:id/edit', forceAuthorize, async (req,res) => {
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.render('not-found')
        return
    }
    const doesIdExist = await CommentsModel.exists({ _id: req.params.id });
    if(doesIdExist === null) {
        res.render('not-found')
        return
    }
    const comment = await CommentsModel.findById(req.params.id).lean()
    res.render('comments/comment-edit', comment)
})
router.post('/:id/edit', forceAuthorize, async (req,res) => {
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.render('not-found')
        return
    }
    const doesIdExist = await CommentsModel.exists({ _id: req.params.id });
    if(doesIdExist === null) {
        res.render('not-found')
        return
    }
    const comment = await CommentsModel.findById(req.params.id)
    if(res.locals.fullName) {
        const result = await utils.checkAuthorUsername(res.locals.fullName, comment.author)
    if(result == true) {
        await postsModel.findById(comment.postId).updateOne({_id: comment.postId, "comments.description": `${comment.description}`}, { $set: {"comments.$.description": `${req.body.description}`} }).lean()
    
    comment.description = req.body.description
    await comment.save()
    
    res.redirect(`/comments/${req.params.id}`)
    }
    else {
        res.status(401).render('unauthorized')
    }
    }
    else {
        const result = await utils.checkAuthorUsername(res.locals.loginInfo, comment.author)
    if(result == true) {
        await postsModel.findById(comment.postId).updateOne({_id: comment.postId, "comments.description": `${comment.description}`}, { $set: {"comments.$.description": `${req.body.description}`} }).lean()
    
    comment.description = req.body.description
    await comment.save()
    
    res.redirect(`/comments/${req.params.id}`)
    }
    else {
        res.status(401).render('unauthorized')
    }
    }
    
    
})
router.get('/:id/delete', forceAuthorize, async (req,res) => {
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.render('not-found')
        return
    }
    const doesIdExist = await CommentsModel.exists({ _id: req.params.id });
    if(doesIdExist === null) {
        res.render('not-found')
        return
    }
    const comment = await CommentsModel.findById(req.params.id)
    if(res.locals.fullName) {
        const result = await utils.checkAuthorUsername(res.locals.fullName, comment.author)
    if(result == true) {
        await postsModel.findById(comment.postId).updateOne({_id: comment.postId}, {$pull: {comments: {_id: comment._id}}})
        
        await comment.delete()
        res.redirect('/comments')
    }
    else {
        res.status(401).render('unauthorized')
    }
    }
    else {
        const result = await utils.checkAuthorUsername(res.locals.loginInfo, comment.author)
    if(result == true) {
        await postsModel.findById(comment.postId).updateOne({_id: comment.postId}, {$pull: {comments: {_id: comment._id}}})
        
        await comment.delete()
        res.redirect('/comments')
    }
    else {
        res.status(401).render('unauthorized')
    }
    }
    
})

// router.use('/', (req,res) => {
//     res.status(404).render('not-found')
//   })

module.exports = router
