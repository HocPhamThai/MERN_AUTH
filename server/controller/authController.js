const User = require('../models/User')
const { hashPassword, comparedPassword } = require('../helpers/auth')
const jwt = require('jsonwebtoken')

const test = (req, res) => {
  res.json('testing is running!!!')
}

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name) {
      return res.status(400).json({ error: 'Name is required' })
    }
    if (!password || password.length < 6) {
      return res.status(400).json({
        error: 'Password is required and should be at least 6 characters long',
      })
    }
    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }
    const exist = await User.findOne({ email })
    if (exist) {
      return res.status(400).json({ error: 'Email already exist' })
    }

    const hashed = await hashPassword(password)
    const user = User.create({ name, email, password: hashed })
    return res.status(200).json({ message: 'User created successfully!!!' })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) {
      return res.json({ error: 'User not found' })
    }
    const match = await comparedPassword(password, user.password)
    if (match) {
      jwt.sign(
        { _id: user._id, name: user.name, email: user.email },
        process.env.JWT_SECRET,
        (err, token) => {
          if (err) {
            return res.status(400).json({ error: 'Error in token generation' })
          }
          res.cookie('token', token)
          res.json(user)
        }
      )
    }
    if (!match) {
      res.json({ error: 'Password not matched' })
    }
  } catch (error) {
    console.log(error)
  }
}

const getProfile = async (req, res) => {
  const { token } = req.cookies
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
      if (err) {
        throw new err()
      }
      res.json(user)
    })
  } else {
    res.json(null)
  }
}

module.exports = {
  test,
  registerUser,
  loginUser,
  getProfile,
}
