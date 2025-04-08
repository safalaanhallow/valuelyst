const db = require('../models');
const User = db.user;

// Handle user profile after Auth0 authentication
const handleUserProfile = async (req, res) => {
  // This endpoint is used after Auth0 authentication to sync user data
  try {
    if (!req.auth) {
      return res.status(401).json({ message: 'No authentication information' });
    }

    const auth0Id = req.auth.sub;
    const email = req.auth[`${process.env.AUTH0_AUDIENCE}/email`] || req.auth.email;
    const username = req.auth[`${process.env.AUTH0_AUDIENCE}/username`] || email.split('@')[0];
    
    // Get roles from Auth0 token
    const userRoles = req.auth[`${process.env.AUTH0_AUDIENCE}/roles`] || ['Client'];
    // Use the highest privilege role if user has multiple
    const roleHierarchy = { 'Admin': 3, 'Appraiser': 2, 'Reviewer': 1, 'Client': 0 };
    const role = userRoles.reduce((prev, curr) => {
      if (roleHierarchy[curr] > roleHierarchy[prev]) return curr;
      return prev;
    }, 'Client');

    // Find or create user
    let user = await User.findOne({ where: { auth0Id } });

    if (user) {
      // Update existing user
      user.lastLogin = new Date();
      user.email = email; // Update email in case it changed in Auth0
      user.role = role;
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        auth0Id,
        username,
        email,
        role,
        lastLogin: new Date(),
        mfaEnabled: false // Default value, will be updated based on token info
      });
    }

    // Check if MFA is enabled based on token
    const amr = req.auth.amr || [];
    const mfaEnabled = amr.includes('mfa');
    
    if (user.mfaEnabled !== mfaEnabled) {
      user.mfaEnabled = mfaEnabled;
      await user.save();
    }

    // Return user data (excluding sensitive information)
    return res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      mfaEnabled: user.mfaEnabled,
      lastLogin: user.lastLogin
    });
  } catch (error) {
    console.error('Error handling user profile:', error);
    return res.status(500).json({ message: error.message || 'An error occurred while processing user information' });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    if (!req.auth) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const auth0Id = req.auth.sub;
    const user = await User.findOne({ where: { auth0Id } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      mfaEnabled: user.mfaEnabled,
      lastLogin: user.lastLogin
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    return res.status(500).json({ message: error.message || 'An error occurred while retrieving user data' });
  }
};

module.exports = {
  handleUserProfile,
  getUserProfile
};
