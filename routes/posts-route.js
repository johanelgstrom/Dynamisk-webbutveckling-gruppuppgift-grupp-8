
require('dotenv').config()
const express = require("express")
process.env.CONNECTION_STRING

const postsModel = require("../models/postsModel");
const { getUniqueFilename } = require('../utils');
const router = express.Router();
const fileupload = require('express-fileupload')


router.get('/', async (req, res) => {
    
    const articles = await postsModel.find()
    .sort([ ["time", "desc"] ])
    .lean()
    res.render('posts', { articles})

})

router.get('/seed-data', async (req,res) => {
    const newArticle = new postsModel({
        title: "myfirst post",
        content: "this is my first post"
    })

    await newArticle.save();

    res.sendStatus(200);
})

router.get('/new-post', (req,res) => {
    res.render('new-post')
})

router.post('/new-post', async (req,res) => {

    const image = req.files.image
    const filename = getUniqueFilename(image.name)
    const uploadpath = __dirname + '/../public/uploads/' + filename

    await image.mv(uploadpath)

    const newArticle = new postsModel({
        title: req.body.title,
        imageName: req.body.imageName,
        imgUrl: '/uploads/' + filename
    })

    const result = await newArticle.save()
    res.redirect('read-post/' + result._id)
})

router.get('/read-post/:id', async (req,res) => {
    const article = await postsModel.findById(req.params.id).lean()
    res.render('read-post', article)
})

module.exports = router;