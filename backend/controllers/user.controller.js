const db = require('../models');
const User = db.user;

// Get all users - restricted to Admin and Appraiser roles
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error retrieving users:', error);
    return res.status(500).json({ message: error.message || 'An error occurred while retrieving users' });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: `User with ID ${id} not found` });
    }
    
    return res.status(200).json(user);
  } catch (error) {
    console.error(`Error retrieving user with ID ${id}:`, error);
    return res.status(500).json({ message: error.message || `An error occurred while retrieving user with ID ${id}` });
  }
};

// Update user - Admin can update any user, users can only update their own profile
const updateUser = async (req, res) => {
  const { id } = req.params;
  const auth0Id = req.auth.sub;
  const userRole = req.auth[`${process.env.AUTH0_AUDIENCE}/roles`]?.[0] || 'Client';
  
  try {
    // First find the user to be updated
    const userToUpdate = await User.findByPk(id);
    
    if (!userToUpdate) {
      return res.status(404).json({ message: `User with ID ${id} not found` });
    }
    
    // Find the requesting user
    const requestingUser = await User.findOne({ where: { auth0Id } });
    
    if (!requestingUser) {
      return res.status(404).json({ message: 'Requesting user not found in database' });
    }
    
    // Check permissions - only Admin can update other users
    if (requestingUser.id !== userToUpdate.id && userRole !== 'Admin') {
      return res.status(403).json({ message: 'You can only update your own profile unless you are an Admin' });
    }
    
    // Admin cannot be downgraded by non-admin
    if (userToUpdate.role === 'Admin' && req.body.role && req.body.role !== 'Admin' && userRole !== 'Admin') {
      return res.status(403).json({ message: 'Cannot change Admin role' });
    }
    
    // Update user
    // Only allow certain fields to be updated
    const allowedFields = ['username', 'email'];
    if (userRole === 'Admin') {
      allowedFields.push('role'); // Only Admin can change roles
    }
    
    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });
    
    await userToUpdate.update(updateData);
    
    return res.status(200).json({
      message: 'User updated successfully',
      user: {
        id: userToUpdate.id,
        username: userToUpdate.username,
        email: userToUpdate.email,
        role: userToUpdate.role,
        mfaEnabled: userToUpdate.mfaEnabled,
        lastLogin: userToUpdate.lastLogin
      }
    });
  } catch (error) {
    console.error(`Error updating user with ID ${id}:`, error);
    return res.status(500).json({ message: error.message || `An error occurred while updating user with ID ${id}` });
  }
};

// Delete user - Admin only
const deleteUser = async (req, res) => {
  const { id } = req.params;
  
  try {
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: `User with ID ${id} not found` });
    }
    
    // Don't allow deleting Admin users
    if (user.role === 'Admin') {
      return res.status(403).json({ message: 'Cannot delete Admin users' });
    }
    
    await user.destroy();
    
    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(`Error deleting user with ID ${id}:`, error);
    return res.status(500).json({ message: error.message || `An error occurred while deleting user with ID ${id}` });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
};
