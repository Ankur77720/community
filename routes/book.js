const mongoose = require('mongoose')

var bookSchema = mongoose.Schema({
    title: String,
    class: String,
    board: String,
    images: String,
    desc: String,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
})


module.exports = mongoose.model('book', bookSchema)

