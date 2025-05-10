const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/db-config');
const { User } = require('../models');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn
  });
};

// @desc    Register a new user
// @route   POST /api/signup
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password });

    const token = generateToken(user.id);
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profilePicUrl: user.profilePicUrl
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Auth user & get token
// @route   POST /api/login
const authUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (user && (await user.comparePassword(password))) {
      const token = generateToken(user.id);
      
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          profilePicUrl: user.profilePicUrl
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/logout
const logoutUser = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/check-auth
const getUserProfile = async (req, res, next) => {
  try {
    if (!req.cookies.token) {
      return res.status(200).json({ user: null });
    }

    const decoded = jwt.verify(req.cookies.token, jwtConfig.secret);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      res.clearCookie('token');
      return res.status(200).json({ user: null });
    }

    res.json({ user });
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      res.clearCookie('token');
      return res.status(200).json({ user: null });
    }
    next(err);
  }
};

module.exports = {
  registerUser,
  authUser,
  logoutUser,
  getUserProfile
};