const express = require('express');
const router = express.Router();
const {
  registerUser,
  authUser,
  logoutUser,
  getUserProfile
} = require('../controllers/authController');

router.post('/signup', registerUser);
router.post('/login', authUser);
router.post('/logout', logoutUser);
router.get('/check-auth', getUserProfile);

module.exports = router;