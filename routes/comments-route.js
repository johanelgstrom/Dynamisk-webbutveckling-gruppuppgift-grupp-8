const express = require('express')
const utils = require('../utils.js')
const CommentsModel = require('../models/CommentsModel.js')

const router = express.Router()

router.get('/', async (req,res) => {
    const comments = await CommentsModel.find().lean()

    res.render('comments/comments-list', {comments})
})

// ANVÄND DENNA FÖR ATT SKICKA IN TESTKOMMENTARER I DATABASEN
router.get('/seed-data', async (req,res) => {
    const newComment = new CommentsModel({
        postId: '34534534535',
        description: 'wAAAAAAAAAAAAAAAAAAAAA',
        time: Date.now(),
        likes: 444
    })

    await newComment.save()

    res.redirect('/comments')
})
router.use('/', (req,res) => {
    res.status(404).render('not-found')
  })
// ANVÄND DENNA FÖR ATT SKICKA IN TESTKOMMENTARER I DATABASEN

router.get('/:id', async (req,res) => {
    const comment = await CommentsModel.findById(req.params.id).lean()
    res.render('comments/comment-single', comment)
})


module.exports = router