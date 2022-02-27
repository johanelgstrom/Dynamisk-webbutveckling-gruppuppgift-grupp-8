const mongoose = require('mongoose')

const commentsSchema = new mongoose.Schema({
    postId: {type: String, required: true},
    description: {type: String, required: true},
    time: {type: Number, required: true},
    likes: Number
})

const CommentsModel = mongoose.model('Comments', commentsSchema)

module.exports = CommentsModel