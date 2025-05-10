const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/db-config');
const { User } = require('../models');

const protect = async (req, res, next) => {
  let token;

  if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = { protect };