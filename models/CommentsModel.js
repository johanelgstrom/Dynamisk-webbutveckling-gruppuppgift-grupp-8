const mongoose = require('mongoose')

const commentsSchema = new mongoose.Schema({
    author: {type: String, required: true},
    postId: {type: String, required: true},
    description: {type: String, required: true},
    time: {type: Number, default: Date.now},
    likes: []
})

const CommentsModel = mongoose.model('Comments', commentsSchema)

module.exports = CommentsModel