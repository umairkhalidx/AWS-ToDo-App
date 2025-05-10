const { User } = require('../models');

// @desc    Update user profile
// @route   PUT /api/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByPk(req.user.id);

    if (email !== user.email) {
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    user.name = name;
    user.email = email;
    await user.save();

    res.json({
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

// @desc    Get user profile picture
// @route   GET /api/profile-pic
const getProfilePic = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['profilePicUrl']
    });
    res.json({ profilePicUrl: user.profilePicUrl || null });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  updateProfile,
  getProfilePic
};