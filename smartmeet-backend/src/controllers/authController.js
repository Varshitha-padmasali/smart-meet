const User = require('../models/User')
const generateToken = require('../utils/generateToken')

// Builds a safe API response without exposing the password hash.
function sendAuthResponse(res, statusCode, user) {
  res.status(statusCode).json({
    token: generateToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
    },
  })
}

// Handles new user registration and returns a JWT for immediate authenticated use.
async function signup(req, res) {
  try {
    const { name, email, password, username } = req.body

    if (!name || !email || !password || !username) {
      return res.status(400).json({
        message: 'Name, username, email, and password are required',
      })
    }

    const normalizedUsername = username.trim().toLowerCase()
    const existingUser = await User.findOne({
      $or: [{ email }, { username: normalizedUsername }],
    })

    if (existingUser) {
      return res.status(409).json({ message: 'Email or username already exists' })
    }

    const user = await User.create({
      email,
      name,
      password,
      username: normalizedUsername,
    })
    return sendAuthResponse(res, 201, user)
  } catch (error) {
    return res.status(500).json({ message: 'Signup failed', error: error.message })
  }
}

// Handles user login by checking credentials and returning a JWT when valid.
async function login(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const user = await User.findOne({ email: normalizedEmail }).select('+password')

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    return sendAuthResponse(res, 200, user)
  } catch (error) {
    return res.status(500).json({ message: 'Login failed', error: error.message })
  }
}

// Returns the authenticated user's profile from the JWT middleware.
async function getCurrentUser(req, res) {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      username: req.user.username,
    },
  })
}

module.exports = {
  getCurrentUser,
  login,
  signup,
}
