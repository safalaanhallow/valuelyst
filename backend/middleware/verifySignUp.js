const db = require('../models');
const User = db.user;

// Check if username or email is already in use
const checkDuplicateUsernameOrEmail = async (req, res, next) => {
  try {
    // Check for duplicate username
    const userByUsername = await User.findOne({
      where: {
        username: req.body.username
      }
    });

    if (userByUsername) {
      return res.status(400).json({
        message: "Username is already in use!"
      });
    }

    // Check for duplicate email
    const userByEmail = await User.findOne({
      where: {
        email: req.body.email
      }
    });

    if (userByEmail) {
      return res.status(400).json({
        message: "Email is already in use!"
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: error.message || "An error occurred during user registration."
    });
  }
};

module.exports = {
  checkDuplicateUsernameOrEmail
};
