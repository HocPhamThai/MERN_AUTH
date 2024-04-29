const { mongoose } = require('mongoose')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
})

const userModel = mongoose.model('user', userSchema)
module.exports = userModel
