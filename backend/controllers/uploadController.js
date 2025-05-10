const { User } = require('../models');
const { uploadFile, deleteFile } = require('../services/s3Service');

// @desc    Upload task PDF
// @route   POST /api/upload-task-pdf
const uploadTaskPdf = async (req, res, next) => {
  try {
    if (!req.files || !req.files.pdf) {
      return res.status(400).json({ message: 'Please upload a PDF file' });
    }

    const pdfFile = req.files.pdf;
    
    if (pdfFile.mimetype !== 'application/pdf') {
      return res.status(400).json({ message: 'Please upload a PDF file only' });
    }

    // Delete old PDF if exists
    const user = await User.findByPk(req.user.id);
    if (user.pdfUrl) {
      try {
        await deleteFile(user.pdfUrl);
      } catch (err) {
        console.error('Error deleting old PDF:', err);
      }
    }

    // Upload new PDF
    const pdfUrl = await uploadFile(pdfFile, 'task-pdfs');

    // Update user with new PDF URL
    user.pdfUrl = pdfUrl;
    await user.save();

    res.json({ pdfUrl });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload profile picture
// @route   POST /api/upload-profile-pic
const uploadProfilePic = async (req, res, next) => {
  try {
    if (!req.files || !req.files.profilePic) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    const imageFile = req.files.profilePic;
    
    if (!imageFile.mimetype.startsWith('image')) {
      return res.status(400).json({ message: 'Please upload an image file only' });
    }

    // Delete old profile pic if exists
    const user = await User.findByPk(req.user.id);
    if (user.profilePicUrl) {
      try {
        await deleteFile(user.profilePicUrl);
      } catch (err) {
        console.error('Error deleting old profile picture:', err);
      }
    }

    // Upload new profile pic
    const profilePicUrl = await uploadFile(imageFile, 'profile-pics');

    // Update user with new profile pic URL
    user.profilePicUrl = profilePicUrl;
    await user.save();

    res.json({ profilePicUrl });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadTaskPdf,
  uploadProfilePic
};
