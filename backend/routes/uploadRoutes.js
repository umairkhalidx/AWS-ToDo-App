const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  uploadTaskPdf,
  uploadProfilePic
} = require('../controllers/uploadController');

router.use(protect);

router.post('/upload-task-pdf', uploadTaskPdf);
router.post('/upload-profile-pic', uploadProfilePic);

module.exports = router;