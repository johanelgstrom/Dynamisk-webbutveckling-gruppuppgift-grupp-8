const { default: mongoose } = require('mongoose')
const moongose = require('mongoose')

const articlesSchema = new mongoose.Schema({
    title: {type: String, required: true},
    time: {type: Number, default: Date.now},
    imageName: {type: String, required: true},
    imgUrl: {type: String, required: true},
    content: String
})

const postsModel = mongoose.model("posts", articlesSchema)

module.exports = postsModel