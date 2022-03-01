const { default: mongoose } = require('mongoose')
const moongose = require('mongoose')

const articlesSchema = new mongoose.Schema({
    title: {type: String, required: true},
    time: {type: Number, default: Date.now},
    content: String,
    comments: Array
})

const postsModel = mongoose.model("posts", articlesSchema)

module.exports = postsModel