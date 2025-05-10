const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  updateProfile,
  getProfilePic
} = require('../controllers/profileController');

router.use(protect);

router.route('/')
  .put(updateProfile);

router.get('/profile-pic', getProfilePic);

module.exports = router;