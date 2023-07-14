const mongoose = require('mongoose')
const plm = require('passport-local-mongoose')

const userSchema = mongoose.Schema({
  username: String,
  contactNumber: String,
  email: String,
  books: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'book'
    }
  ]
})

userSchema.plugin(plm)

module.exports = mongoose.model('user', userSchema)