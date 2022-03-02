const express = require('express')
const utils = require('../utils.js')
const CommentsModel = require('../models/CommentsModel.js')

const router = express.Router()

router.get('/', async (req,res) => {
    const comments = await CommentsModel.find().lean()
    const username = res.locals.username
    console.log(res.locals.username);
    
    res.render('comments/comments-list', {comments, username})
})

// ANVÄND DENNA FÖR ATT SKICKA IN TESTKOMMENTARER I DATABASEN
router.get('/seed-data', async (req,res) => {
    const newComment = new CommentsModel({
        postId: '34534534535',
        description: 'wAAAAAAAAAAAAAAAAAAAAA',
        time: Date.now(),
    })

    await newComment.save()

    res.redirect('/comments')
})
// router.use('/', (req,res) => {
//     res.status(404).render('not-found')
//   })
// ANVÄND DENNA FÖR ATT SKICKA IN TESTKOMMENTARER I DATABASEN

router.get('/:id', async (req,res) => {
    const comment = await CommentsModel.findById(req.params.id).lean()
    const result = await utils.checkIfLiked(res.locals.username, req.params.id, CommentsModel)
    if (result == true) {
        console.log('TRUE');
        res.render('comments/comment-single', {comment, result})
    }
    else {
        console.log('FALSE');
        res.render('comments/comment-single', comment)
    }
    console.log(result);
})

router.get('/:id/like', async (req,res) => {
    const comment = await CommentsModel.findById(req.params.id).lean()
    await CommentsModel.updateOne({_id: req.params.id}, { $push: {likes: res.locals.username}})
    res.redirect('/comments')
})

module.exports = router