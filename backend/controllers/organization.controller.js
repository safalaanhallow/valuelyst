const db = require('../models');
const Organization = db.organization;
const User = db.user;

// Create a new organization - Admin only
const createOrganization = async (req, res) => {
  try {
    const auth0Id = req.auth.sub;
    const user = await User.findOne({ where: { auth0Id } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Only Admin can create organizations
    if (user.role !== 'Admin') {
      return res.status(403).json({ 
        message: 'Access denied: Only administrators can create organizations' 
      });
    }
    
    // Create the organization
    const organizationData = {
      name: req.body.name,
      description: req.body.description || '',
      type: req.body.type || 'Other',
      address: req.body.address ? JSON.stringify(req.body.address) : null,
      contact_info: req.body.contact_info ? JSON.stringify(req.body.contact_info) : null,
      subscription_level: req.body.subscription_level || 'Basic',
      subscription_expires: req.body.subscription_expires || null
    };
    
    const organization = await Organization.create(organizationData);
    
    // Parse JSON fields
    const result = {
      ...organization.get({ plain: true }),
      address: organization.address ? JSON.parse(organization.address) : null,
      contact_info: organization.contact_info ? JSON.parse(organization.contact_info) : null,
    };
    
    return res.status(201).json(result);
  } catch (error) {
    console.error('Error creating organization:', error);
    return res.status(500).json({ 
      message: error.message || 'An error occurred while creating the organization' 
    });
  }
};

// Get all organizations - Admin can see all, others only see their own
const getAllOrganizations = async (req, res) => {
  try {
    const auth0Id = req.auth.sub;
    const user = await User.findOne({ where: { auth0Id } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    let organizations;
    
    // Role-based filtering
    if (user.role === 'Admin') {
      // Admin can see all organizations
      organizations = await Organization.findAll();
    } else {
      // Others can only see their own organization
      if (!user.orgId) {
        return res.status(200).json([]);
      }
      
      organizations = await Organization.findAll({
        where: { id: user.orgId }
      });
    }
    
    // Parse JSON fields
    const results = organizations.map(org => {
      const plainOrg = org.get({ plain: true });
      
      return {
        ...plainOrg,
        address: plainOrg.address ? JSON.parse(plainOrg.address) : null,
        contact_info: plainOrg.contact_info ? JSON.parse(plainOrg.contact_info) : null,
      };
    });
    
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error retrieving organizations:', error);
    return res.status(500).json({ 
      message: error.message || 'An error occurred while retrieving organizations' 
    });
  }
};

// Get organization by ID
const getOrganizationById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const auth0Id = req.auth.sub;
    const user = await User.findOne({ where: { auth0Id } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if organization exists
    const organization = await Organization.findByPk(id);
    
    if (!organization) {
      return res.status(404).json({ message: `Organization with ID ${id} not found` });
    }
    
    // Check if user has permission to view this organization
    if (user.role !== 'Admin' && user.orgId !== organization.id) {
      return res.status(403).json({ 
        message: 'Access denied: You can only view your own organization' 
      });
    }
    
    // Parse JSON fields
    const result = {
      ...organization.get({ plain: true }),
      address: organization.address ? JSON.parse(organization.address) : null,
      contact_info: organization.contact_info ? JSON.parse(organization.contact_info) : null,
    };
    
    return res.status(200).json(result);
  } catch (error) {
    console.error(`Error retrieving organization with ID ${id}:`, error);
    return res.status(500).json({ 
      message: error.message || `An error occurred while retrieving organization with ID ${id}` 
    });
  }
};

// Update organization - Admin only
const updateOrganization = async (req, res) => {
  const { id } = req.params;
  
  try {
    const auth0Id = req.auth.sub;
    const user = await User.findOne({ where: { auth0Id } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find the organization
    const organization = await Organization.findByPk(id);
    
    if (!organization) {
      return res.status(404).json({ message: `Organization with ID ${id} not found` });
    }
    
    // Only Admins can update any organization
    // Appraisers can update their own organization's basic details
    let canUpdate = false;
    let limitedUpdate = false;
    
    if (user.role === 'Admin') {
      canUpdate = true;
    } else if (user.role === 'Appraiser' && user.orgId === organization.id) {
      canUpdate = true;
      limitedUpdate = true;
    }
    
    if (!canUpdate) {
      return res.status(403).json({ 
        message: 'Access denied: You do not have permission to update this organization' 
      });
    }
    
    // Update data based on role
    const updateData = {};
    
    if (limitedUpdate) {
      // Appraisers can only update certain fields of their own organization
      const allowedFields = ['name', 'description', 'contact_info'];
      
      if (req.body.name) updateData.name = req.body.name;
      if (req.body.description) updateData.description = req.body.description;
      if (req.body.contact_info) updateData.contact_info = JSON.stringify(req.body.contact_info);
    } else {
      // Admin can update all fields
      if (req.body.name) updateData.name = req.body.name;
      if (req.body.description) updateData.description = req.body.description;
      if (req.body.type) updateData.type = req.body.type;
      if (req.body.address) updateData.address = JSON.stringify(req.body.address);
      if (req.body.contact_info) updateData.contact_info = JSON.stringify(req.body.contact_info);
      if (req.body.subscription_level) updateData.subscription_level = req.body.subscription_level;
      if (req.body.subscription_expires) updateData.subscription_expires = req.body.subscription_expires;
    }
    
    // Update the organization
    await organization.update(updateData);
    
    // Get the updated organization
    const updatedOrganization = await Organization.findByPk(id);
    
    // Parse JSON fields
    const result = {
      ...updatedOrganization.get({ plain: true }),
      address: updatedOrganization.address ? JSON.parse(updatedOrganization.address) : null,
      contact_info: updatedOrganization.contact_info ? JSON.parse(updatedOrganization.contact_info) : null,
    };
    
    return res.status(200).json(result);
  } catch (error) {
    console.error(`Error updating organization with ID ${id}:`, error);
    return res.status(500).json({ 
      message: error.message || `An error occurred while updating organization with ID ${id}` 
    });
  }
};

// Delete organization - Admin only
const deleteOrganization = async (req, res) => {
  const { id } = req.params;
  
  try {
    const auth0Id = req.auth.sub;
    const user = await User.findOne({ where: { auth0Id } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find the organization
    const organization = await Organization.findByPk(id);
    
    if (!organization) {
      return res.status(404).json({ message: `Organization with ID ${id} not found` });
    }
    
    // Only Admin can delete organizations
    if (user.role !== 'Admin') {
      return res.status(403).json({ 
        message: 'Access denied: Only administrators can delete organizations' 
      });
    }
    
    // Check if organization has users or properties
    const usersCount = await User.count({ where: { orgId: id } });
    if (usersCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete organization with associated users. Remove all users first.' 
      });
    }
    
    const propertiesCount = await db.property.count({ where: { org_id: id } });
    if (propertiesCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete organization with associated properties. Remove all properties first.' 
      });
    }
    
    // Delete the organization
    await organization.destroy();
    
    return res.status(200).json({ message: 'Organization deleted successfully' });
  } catch (error) {
    console.error(`Error deleting organization with ID ${id}:`, error);
    return res.status(500).json({ 
      message: error.message || `An error occurred while deleting organization with ID ${id}` 
    });
  }
};

// Get all users for an organization - Admin or org Appraiser only
const getOrganizationUsers = async (req, res) => {
  const { id } = req.params;
  
  try {
    const auth0Id = req.auth.sub;
    const user = await User.findOne({ where: { auth0Id } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if organization exists
    const organization = await Organization.findByPk(id);
    
    if (!organization) {
      return res.status(404).json({ message: `Organization with ID ${id} not found` });
    }
    
    // Check if user has permission to view organization users
    let canViewUsers = false;
    
    if (user.role === 'Admin') {
      canViewUsers = true;
    } else if ((user.role === 'Appraiser' || user.role === 'Reviewer') && user.orgId === organization.id) {
      canViewUsers = true;
    }
    
    if (!canViewUsers) {
      return res.status(403).json({ 
        message: 'Access denied: You do not have permission to view users in this organization' 
      });
    }
    
    // Get users for this organization
    const users = await User.findAll({
      where: { orgId: id },
      attributes: { exclude: ['password'] }
    });
    
    return res.status(200).json(users);
  } catch (error) {
    console.error(`Error retrieving users for organization with ID ${id}:`, error);
    return res.status(500).json({ 
      message: error.message || `An error occurred while retrieving users for organization with ID ${id}` 
    });
  }
};

// Update user role within organization - Admin or organization Appraiser only
const updateUserRole = async (req, res) => {
  try {
    const { orgId, userId } = req.params;
    const { role } = req.body;
    
    if (!role) {
      return res.status(400).json({ message: 'Role is required' });
    }
    
    // Validate role
    const validRoles = ['Admin', 'Appraiser', 'Reviewer', 'Client'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}` 
      });
    }
    
    // Check requester authorization
    const auth0Id = req.auth.sub;
    const requester = await User.findOne({ where: { auth0Id } });
    
    if (!requester) {
      return res.status(404).json({ message: 'Requester not found' });
    }
    
    // Get the user to update
    const userToUpdate = await User.findByPk(userId);
    if (!userToUpdate) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get the organization
    const organization = await Organization.findByPk(orgId);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    
    // Authorization checks
    // 1. Admin can update any user's role
    // 2. Organization Appraiser can only update users in their organization, and cannot make someone an Admin
    if (requester.role !== 'Admin') {
      // Not an admin, check if org appraiser with rights to update
      if (requester.role !== 'Appraiser' || requester.orgId !== parseInt(orgId)) {
        return res.status(403).json({ 
          message: 'Access denied: Only admins or organization appraisers can update user roles' 
        });
      }
      
      // Org appraisers cannot make someone an Admin
      if (role === 'Admin') {
        return res.status(403).json({ 
          message: 'Access denied: Only system administrators can assign Admin role' 
        });
      }
      
      // Ensure user belongs to the same organization
      if (userToUpdate.orgId !== parseInt(orgId)) {
        return res.status(403).json({ 
          message: 'Access denied: Cannot update user from different organization' 
        });
      }
    }
    
    // Update the user's role
    await userToUpdate.update({ role });
    
    return res.status(200).json({ 
      message: 'User role updated successfully',
      user: {
        id: userToUpdate.id,
        username: userToUpdate.username,
        email: userToUpdate.email,
        role: userToUpdate.role,
        orgId: userToUpdate.orgId
      } 
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return res.status(500).json({ 
      message: error.message || 'An error occurred while updating user role' 
    });
  }
};

// Add user to organization - Admin or organization Appraiser only
const addUserToOrganization = async (req, res) => {
  try {
    const { orgId } = req.params;
    const { userId, role } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Default role to Client if not specified
    const userRole = role || 'Client';
    
    // Validate role
    const validRoles = ['Admin', 'Appraiser', 'Reviewer', 'Client'];
    if (!validRoles.includes(userRole)) {
      return res.status(400).json({ 
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}` 
      });
    }
    
    // Check requester authorization
    const auth0Id = req.auth.sub;
    const requester = await User.findOne({ where: { auth0Id } });
    
    if (!requester) {
      return res.status(404).json({ message: 'Requester not found' });
    }
    
    // Get the user to add
    const userToAdd = await User.findByPk(userId);
    if (!userToAdd) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get the organization
    const organization = await Organization.findByPk(orgId);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    
    // Authorization checks
    // 1. Admin can add any user to any organization
    // 2. Organization Appraiser can only add users to their organization
    if (requester.role !== 'Admin') {
      // Not an admin, check if org appraiser with rights
      if (requester.role !== 'Appraiser' || requester.orgId !== parseInt(orgId)) {
        return res.status(403).json({ 
          message: 'Access denied: Only admins or organization appraisers can add users to organization' 
        });
      }
      
      // Org appraisers cannot make someone an Admin
      if (userRole === 'Admin') {
        return res.status(403).json({ 
          message: 'Access denied: Only system administrators can assign Admin role' 
        });
      }
    }
    
    // Check if user already belongs to another organization
    if (userToAdd.orgId && userToAdd.orgId !== parseInt(orgId)) {
      return res.status(400).json({ 
        message: 'User already belongs to another organization' 
      });
    }
    
    // Update the user's organization and role
    await userToAdd.update({ 
      orgId: parseInt(orgId),
      role: userRole
    });
    
    return res.status(200).json({ 
      message: 'User added to organization successfully',
      user: {
        id: userToAdd.id,
        username: userToAdd.username,
        email: userToAdd.email,
        role: userToAdd.role,
        orgId: userToAdd.orgId
      } 
    });
  } catch (error) {
    console.error('Error adding user to organization:', error);
    return res.status(500).json({ 
      message: error.message || 'An error occurred while adding user to organization' 
    });
  }
};

// Remove user from organization - Admin or organization Appraiser only
const removeUserFromOrganization = async (req, res) => {
  try {
    const { orgId, userId } = req.params;
    
    // Check requester authorization
    const auth0Id = req.auth.sub;
    const requester = await User.findOne({ where: { auth0Id } });
    
    if (!requester) {
      return res.status(404).json({ message: 'Requester not found' });
    }
    
    // Get the user to remove
    const userToRemove = await User.findByPk(userId);
    if (!userToRemove) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get the organization
    const organization = await Organization.findByPk(orgId);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    
    // Authorization checks
    // 1. Admin can remove any user from any organization
    // 2. Organization Appraiser can only remove users from their organization
    // 3. Cannot remove yourself (to prevent locking out)
    if (userToRemove.id === requester.id) {
      return res.status(403).json({ 
        message: 'Cannot remove yourself from an organization' 
      });
    }
    
    if (requester.role !== 'Admin') {
      // Not an admin, check if org appraiser with rights
      if (requester.role !== 'Appraiser' || requester.orgId !== parseInt(orgId)) {
        return res.status(403).json({ 
          message: 'Access denied: Only admins or organization appraisers can remove users' 
        });
      }
      
      // Org appraisers cannot remove an Admin
      if (userToRemove.role === 'Admin') {
        return res.status(403).json({ 
          message: 'Access denied: Cannot remove an administrator from organization' 
        });
      }
    }
    
    // Check if user belongs to this organization
    if (userToRemove.orgId !== parseInt(orgId)) {
      return res.status(400).json({ 
        message: 'User does not belong to this organization' 
      });
    }
    
    // Update the user's organization and role
    await userToRemove.update({ 
      orgId: null,
      role: 'Client' // Default role when not in an organization
    });
    
    return res.status(200).json({ 
      message: 'User removed from organization successfully',
      user: {
        id: userToRemove.id,
        username: userToRemove.username,
        email: userToRemove.email,
        role: userToRemove.role,
        orgId: userToRemove.orgId
      } 
    });
  } catch (error) {
    console.error('Error removing user from organization:', error);
    return res.status(500).json({ 
      message: error.message || 'An error occurred while removing user from organization' 
    });
  }
};

// Update organization's data export settings - Admin or organization Appraiser only
const updateExportSettings = async (req, res) => {
  try {
    const { orgId } = req.params;
    const exportSettings = req.body;
    
    if (!exportSettings) {
      return res.status(400).json({ message: 'Export settings are required' });
    }
    
    // Check requester authorization
    const auth0Id = req.auth.sub;
    const requester = await User.findOne({ where: { auth0Id } });
    
    if (!requester) {
      return res.status(404).json({ message: 'Requester not found' });
    }
    
    // Get the organization
    const organization = await Organization.findByPk(orgId);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    
    // Authorization checks
    // 1. Admin can update any organization's settings
    // 2. Organization Appraiser can only update their organization's settings
    if (requester.role !== 'Admin') {
      // Not an admin, check if org appraiser with rights
      if (requester.role !== 'Appraiser' || requester.orgId !== parseInt(orgId)) {
        return res.status(403).json({ 
          message: 'Access denied: Only admins or organization appraisers can update export settings' 
        });
      }
    }
    
    // Get current export settings
    const currentSettings = organization.data_export_settings 
      ? JSON.parse(organization.data_export_settings) 
      : {
          allow_csv_export: true,
          allow_pdf_export: true,
          allow_property_export: true,
          allow_comp_export: true,
          require_approval: false,
          retention_period_days: 30
        };
        
    // Update with new settings
    const updatedSettings = {
      ...currentSettings,
      ...exportSettings
    };
    
    // Save to database
    await organization.update({
      data_export_settings: JSON.stringify(updatedSettings)
    });
    
    return res.status(200).json({
      message: 'Export settings updated successfully',
      data_export_settings: updatedSettings
    });
  } catch (error) {
    console.error('Error updating export settings:', error);
    return res.status(500).json({ 
      message: error.message || 'An error occurred while updating export settings' 
    });
  }
};

// Get organization's data export settings - Members of the organization can view
const getExportSettings = async (req, res) => {
  try {
    const { orgId } = req.params;
    
    // Check requester authorization
    const auth0Id = req.auth.sub;
    const requester = await User.findOne({ where: { auth0Id } });
    
    if (!requester) {
      return res.status(404).json({ message: 'Requester not found' });
    }
    
    // Get the organization
    const organization = await Organization.findByPk(orgId);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    
    // Authorization checks
    // 1. Admin can view any organization's settings
    // 2. Users can only view their organization's settings
    if (requester.role !== 'Admin' && requester.orgId !== parseInt(orgId)) {
      return res.status(403).json({ 
        message: 'Access denied: You can only view export settings for your organization' 
      });
    }
    
    // Get export settings
    const exportSettings = organization.data_export_settings 
      ? JSON.parse(organization.data_export_settings) 
      : {
          allow_csv_export: true,
          allow_pdf_export: true,
          allow_property_export: true,
          allow_comp_export: true,
          require_approval: false,
          retention_period_days: 30
        };
    
    return res.status(200).json(exportSettings);
  } catch (error) {
    console.error('Error getting export settings:', error);
    return res.status(500).json({ 
      message: error.message || 'An error occurred while retrieving export settings' 
    });
  }
};

module.exports = {
  createOrganization,
  getAllOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
  getOrganizationUsers,
  updateUserRole,
  addUserToOrganization,
  removeUserFromOrganization,
  updateExportSettings,
  getExportSettings
};
