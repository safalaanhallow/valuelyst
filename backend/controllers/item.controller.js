const db = require('../models');
const Item = db.item;
const User = db.user;

// Get all items - different behavior based on role
const getAllItems = async (req, res) => {
  try {
    const auth0Id = req.auth.sub;
    const user = await User.findOne({ where: { auth0Id } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    let items;
    
    // Apply role-based filtering
    switch (user.role) {
      case 'Admin':
        // Admins can see all items
        items = await Item.findAll();
        break;
      case 'Appraiser':
        // Appraisers can see all items
        items = await Item.findAll();
        break;
      case 'Reviewer':
        // Reviewers can see all items
        items = await Item.findAll();
        break;
      case 'Client':
      default:
        // Clients can only see their own items
        items = await Item.findAll({
          where: { userId: user.id }
        });
        break;
    }
    
    return res.status(200).json(items);
  } catch (error) {
    console.error('Error retrieving items:', error);
    return res.status(500).json({ message: error.message || 'An error occurred while retrieving items' });
  }
};

// Get item by ID - different behavior based on role
const getItemById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const auth0Id = req.auth.sub;
    const user = await User.findOne({ where: { auth0Id } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find the requested item
    const item = await Item.findByPk(id);
    
    if (!item) {
      return res.status(404).json({ message: `Item with ID ${id} not found` });
    }
    
    // Apply role-based access control
    if (user.role === 'Client' && item.userId !== user.id) {
      return res.status(403).json({ message: 'Access denied: You can only view your own items' });
    }
    
    return res.status(200).json(item);
  } catch (error) {
    console.error(`Error retrieving item with ID ${id}:`, error);
    return res.status(500).json({ message: error.message || `An error occurred while retrieving item with ID ${id}` });
  }
};

// Create item - Clients can only create their own items
const createItem = async (req, res) => {
  try {
    const auth0Id = req.auth.sub;
    const user = await User.findOne({ where: { auth0Id } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Create a new item
    const newItem = {
      name: req.body.name,
      description: req.body.description || '',
      value: req.body.value || 0,
      category: req.body.category || 'Uncategorized',
      priority: req.body.priority || 0,
      userId: user.id
    };
    
    // For non-Admin/Appraiser users, force the userId to be the current user
    if (user.role !== 'Admin' && user.role !== 'Appraiser') {
      newItem.userId = user.id;
    } else if (req.body.userId) {
      // Allow Admin/Appraiser to specify userId
      newItem.userId = req.body.userId;
    }
    
    const item = await Item.create(newItem);
    
    return res.status(201).json(item);
  } catch (error) {
    console.error('Error creating item:', error);
    return res.status(500).json({ message: error.message || 'An error occurred while creating the item' });
  }
};

// Update item - role-based permissions
const updateItem = async (req, res) => {
  const { id } = req.params;
  
  try {
    const auth0Id = req.auth.sub;
    const user = await User.findOne({ where: { auth0Id } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find the item to be updated
    const item = await Item.findByPk(id);
    
    if (!item) {
      return res.status(404).json({ message: `Item with ID ${id} not found` });
    }
    
    // Apply role-based access control
    if (user.role === 'Client' && item.userId !== user.id) {
      return res.status(403).json({ message: 'Access denied: You can only update your own items' });
    }
    
    if (user.role === 'Reviewer' && item.userId !== user.id) {
      // Reviewers can only update certain fields of any item
      const allowedFields = ['priority'];
      const updateData = {};
      
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });
      
      await item.update(updateData);
    } else if (user.role === 'Appraiser' && item.userId !== user.id) {
      // Appraisers can update value and category of any item
      const allowedFields = ['value', 'category', 'priority'];
      const updateData = {};
      
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });
      
      await item.update(updateData);
    } else {
      // Admin or item owner can update all fields
      const allowedFields = ['name', 'description', 'value', 'category', 'priority'];
      const updateData = {};
      
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });
      
      // Admin can change the owner of an item
      if (user.role === 'Admin' && req.body.userId !== undefined) {
        updateData.userId = req.body.userId;
      }
      
      await item.update(updateData);
    }
    
    // Get the updated item
    const updatedItem = await Item.findByPk(id);
    
    return res.status(200).json(updatedItem);
  } catch (error) {
    console.error(`Error updating item with ID ${id}:`, error);
    return res.status(500).json({ message: error.message || `An error occurred while updating item with ID ${id}` });
  }
};

// Delete item - role-based permissions
const deleteItem = async (req, res) => {
  const { id } = req.params;
  
  try {
    const auth0Id = req.auth.sub;
    const user = await User.findOne({ where: { auth0Id } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find the item to be deleted
    const item = await Item.findByPk(id);
    
    if (!item) {
      return res.status(404).json({ message: `Item with ID ${id} not found` });
    }
    
    // Apply role-based access control
    // Only Admin or the item owner can delete an item
    if (user.role !== 'Admin' && item.userId !== user.id) {
      return res.status(403).json({ message: 'Access denied: You can only delete your own items' });
    }
    
    await item.destroy();
    
    return res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error(`Error deleting item with ID ${id}:`, error);
    return res.status(500).json({ message: error.message || `An error occurred while deleting item with ID ${id}` });
  }
};

// Get all items for a specific user - role-based permissions
const getUserItems = async (req, res) => {
  const { userId } = req.params;
  
  try {
    const auth0Id = req.auth.sub;
    const user = await User.findOne({ where: { auth0Id } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Apply role-based access control
    // Clients can only see their own items
    if (user.role === 'Client' && user.id !== parseInt(userId)) {
      return res.status(403).json({ message: 'Access denied: You can only view your own items' });
    }
    
    const items = await Item.findAll({
      where: { userId: parseInt(userId) }
    });
    
    return res.status(200).json(items);
  } catch (error) {
    console.error(`Error retrieving items for user ${userId}:`, error);
    return res.status(500).json({ message: error.message || `An error occurred while retrieving items for user ${userId}` });
  }
};

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getUserItems
};
