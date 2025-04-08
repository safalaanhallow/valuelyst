const db = require('../models');
const Property = db.property;
const User = db.user;
const Organization = db.organization;

// Create a new property
const createProperty = async (req, res) => {
  try {
    const auth0Id = req.auth.sub;
    const user = await User.findOne({ where: { auth0Id } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Only Admin and Appraiser roles can create properties
    if (user.role !== 'Admin' && user.role !== 'Appraiser') {
      return res.status(403).json({ 
        message: 'Access denied: Only Admin and Appraiser roles can create properties' 
      });
    }
    
    // Verify organization exists if specified
    const orgId = req.body.org_id || user.orgId;
    if (!orgId) {
      return res.status(400).json({ 
        message: 'Organization ID is required' 
      });
    }
    
    const organization = await Organization.findByPk(orgId);
    if (!organization) {
      return res.status(404).json({ 
        message: `Organization with ID ${orgId} not found` 
      });
    }
    
    // Process JSON fields
    const propertyData = {
      org_id: orgId,
      created_by: user.id,
      identification: req.body.identification ? JSON.stringify(req.body.identification) : null,
      zoning: req.body.zoning ? JSON.stringify(req.body.zoning) : null,
      physical: req.body.physical ? JSON.stringify(req.body.physical) : null,
      environmental: req.body.environmental ? JSON.stringify(req.body.environmental) : null,
      accessibility: req.body.accessibility ? JSON.stringify(req.body.accessibility) : null,
      // Financial data fields
      income: req.body.income ? JSON.stringify(req.body.income) : null,
      expenses: req.body.expenses ? JSON.stringify(req.body.expenses) : null,
      debt: req.body.debt ? JSON.stringify(req.body.debt) : null,
      valuations: req.body.valuations ? JSON.stringify(req.body.valuations) : null,
      // Tenant data field
      tenants: req.body.tenants ? JSON.stringify(req.body.tenants) : null,
      // Comps and adjustments data fields
      comps: req.body.comps ? JSON.stringify(req.body.comps) : null,
      adjustments: req.body.adjustments ? JSON.stringify(req.body.adjustments) : null,
    };
    
    // Create the property
    const property = await Property.create(propertyData);
    
    // Return the created property with JSON parsed fields
    const result = {
      ...property.get({ plain: true }),
      identification: property.identification ? JSON.parse(property.identification) : null,
      zoning: property.zoning ? JSON.parse(property.zoning) : null,
      physical: property.physical ? JSON.parse(property.physical) : null,
      environmental: property.environmental ? JSON.parse(property.environmental) : null,
      accessibility: property.accessibility ? JSON.parse(property.accessibility) : null,
      // Parse financial data fields
      income: property.income ? JSON.parse(property.income) : null,
      expenses: property.expenses ? JSON.parse(property.expenses) : null,
      debt: property.debt ? JSON.parse(property.debt) : null,
      valuations: property.valuations ? JSON.parse(property.valuations) : null,
      // Parse tenant data
      tenants: property.tenants ? JSON.parse(property.tenants) : null,
      // Parse comps and adjustments data
      comps: property.comps ? JSON.parse(property.comps) : null,
      adjustments: property.adjustments ? JSON.parse(property.adjustments) : null
    };
    
    return res.status(201).json(result);
  } catch (error) {
    console.error('Error creating property:', error);
    return res.status(500).json({ 
      message: error.message || 'An error occurred while creating the property' 
    });
  }
};

// Get all properties with role-based access control
const getAllProperties = async (req, res) => {
  try {
    const auth0Id = req.auth.sub;
    const user = await User.findOne({ where: { auth0Id } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    let properties;
    
    // Role-based filtering
    if (user.role === 'Admin') {
      // Admin can see all properties
      properties = await Property.findAll();
    } else if (user.role === 'Appraiser' || user.role === 'Reviewer') {
      // Appraisers and Reviewers can see all properties in their organization
      if (!user.orgId) {
        return res.status(400).json({ 
          message: 'You must be associated with an organization to view properties' 
        });
      }
      
      properties = await Property.findAll({
        where: { org_id: user.orgId }
      });
    } else {
      // Clients can only see properties they created or are assigned to
      // This would require additional permission modeling that's not currently implemented
      // For now, just return properties from their org
      if (!user.orgId) {
        return res.status(400).json({ 
          message: 'You must be associated with an organization to view properties' 
        });
      }
      
      properties = await Property.findAll({
        where: { org_id: user.orgId }
      });
    }
    
    // Parse JSON fields for each property
    const results = properties.map(property => {
      const plainProperty = property.get({ plain: true });
      
      return {
        ...plainProperty,
        identification: plainProperty.identification ? JSON.parse(plainProperty.identification) : null,
        zoning: plainProperty.zoning ? JSON.parse(plainProperty.zoning) : null,
        physical: plainProperty.physical ? JSON.parse(plainProperty.physical) : null,
        environmental: plainProperty.environmental ? JSON.parse(plainProperty.environmental) : null,
        accessibility: plainProperty.accessibility ? JSON.parse(plainProperty.accessibility) : null,
        // Parse financial data fields
        income: plainProperty.income ? JSON.parse(plainProperty.income) : null,
        expenses: plainProperty.expenses ? JSON.parse(plainProperty.expenses) : null,
        debt: plainProperty.debt ? JSON.parse(plainProperty.debt) : null,
        valuations: plainProperty.valuations ? JSON.parse(plainProperty.valuations) : null,
        // Parse tenant data
        tenants: plainProperty.tenants ? JSON.parse(plainProperty.tenants) : null,
        // Parse comps and adjustments data
        comps: plainProperty.comps ? JSON.parse(plainProperty.comps) : null,
        adjustments: plainProperty.adjustments ? JSON.parse(plainProperty.adjustments) : null,
      };
    });
    
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error retrieving properties:', error);
    return res.status(500).json({ 
      message: error.message || 'An error occurred while retrieving properties' 
    });
  }
};

// Get property by ID with role-based access control
const getPropertyById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const auth0Id = req.auth.sub;
    const user = await User.findOne({ where: { auth0Id } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find the property
    const property = await Property.findByPk(id);
    
    if (!property) {
      return res.status(404).json({ message: `Property with ID ${id} not found` });
    }
    
    // Check if user has permission to view this property
    if (user.role !== 'Admin' && property.org_id !== user.orgId) {
      return res.status(403).json({ 
        message: 'Access denied: You can only view properties from your organization' 
      });
    }
    
    // Parse JSON fields
    const result = {
      ...property.get({ plain: true }),
      identification: property.identification ? JSON.parse(property.identification) : null,
      zoning: property.zoning ? JSON.parse(property.zoning) : null,
      physical: property.physical ? JSON.parse(property.physical) : null,
      environmental: property.environmental ? JSON.parse(property.environmental) : null,
      accessibility: property.accessibility ? JSON.parse(property.accessibility) : null,
      // Parse financial data fields
      income: property.income ? JSON.parse(property.income) : null,
      expenses: property.expenses ? JSON.parse(property.expenses) : null,
      debt: property.debt ? JSON.parse(property.debt) : null,
      valuations: property.valuations ? JSON.parse(property.valuations) : null,
    };
    
    return res.status(200).json(result);
  } catch (error) {
    console.error(`Error retrieving property with ID ${id}:`, error);
    return res.status(500).json({ 
      message: error.message || `An error occurred while retrieving property with ID ${id}` 
    });
  }
};

// Update property with role-based access control
const updateProperty = async (req, res) => {
  const { id } = req.params;
  
  try {
    const auth0Id = req.auth.sub;
    const user = await User.findOne({ where: { auth0Id } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find the property
    const property = await Property.findByPk(id);
    
    if (!property) {
      return res.status(404).json({ message: `Property with ID ${id} not found` });
    }
    
    // Check if user has permission to update this property
    if (user.role !== 'Admin' && property.org_id !== user.orgId) {
      return res.status(403).json({ 
        message: 'Access denied: You can only update properties from your organization' 
      });
    }
    
    // Only Admin and Appraiser can update all fields
    // Reviewer has limited update capabilities
    const updateData = {};
    
    // Update tracking info
    updateData.updated_by = user.id;
    
    // Process fields based on role
    if (user.role === 'Admin' || user.role === 'Appraiser') {
      // Can update all fields
      if (req.body.identification) updateData.identification = JSON.stringify(req.body.identification);
      if (req.body.zoning) updateData.zoning = JSON.stringify(req.body.zoning);
      if (req.body.physical) updateData.physical = JSON.stringify(req.body.physical);
      if (req.body.environmental) updateData.environmental = JSON.stringify(req.body.environmental);
      if (req.body.accessibility) updateData.accessibility = JSON.stringify(req.body.accessibility);
      // Financial data fields
      if (req.body.income) updateData.income = JSON.stringify(req.body.income);
      if (req.body.expenses) updateData.expenses = JSON.stringify(req.body.expenses);
      if (req.body.debt) updateData.debt = JSON.stringify(req.body.debt);
      if (req.body.valuations) updateData.valuations = JSON.stringify(req.body.valuations);
      
      // Admin can change organization
      if (user.role === 'Admin' && req.body.org_id) {
        const organization = await Organization.findByPk(req.body.org_id);
        if (!organization) {
          return res.status(404).json({ 
            message: `Organization with ID ${req.body.org_id} not found` 
          });
        }
        updateData.org_id = req.body.org_id;
      }
    } else if (user.role === 'Reviewer') {
      // Reviewers can only update specific fields
      // For example, they might only be allowed to update environmental data
      if (req.body.environmental) updateData.environmental = JSON.stringify(req.body.environmental);
    } else {
      // Clients cannot update properties
      return res.status(403).json({ 
        message: 'Access denied: Clients cannot update properties' 
      });
    }
    
    // Update the property
    await property.update(updateData);
    
    // Get the updated property
    const updatedProperty = await Property.findByPk(id);
    
    // Parse JSON fields
    const result = {
      ...updatedProperty.get({ plain: true }),
      identification: updatedProperty.identification ? JSON.parse(updatedProperty.identification) : null,
      zoning: updatedProperty.zoning ? JSON.parse(updatedProperty.zoning) : null,
      physical: updatedProperty.physical ? JSON.parse(updatedProperty.physical) : null,
      environmental: updatedProperty.environmental ? JSON.parse(updatedProperty.environmental) : null,
      accessibility: updatedProperty.accessibility ? JSON.parse(updatedProperty.accessibility) : null,
      // Parse financial data fields
      income: updatedProperty.income ? JSON.parse(updatedProperty.income) : null,
      expenses: updatedProperty.expenses ? JSON.parse(updatedProperty.expenses) : null,
      debt: updatedProperty.debt ? JSON.parse(updatedProperty.debt) : null,
      valuations: updatedProperty.valuations ? JSON.parse(updatedProperty.valuations) : null,
    };
    
    return res.status(200).json(result);
  } catch (error) {
    console.error(`Error updating property with ID ${id}:`, error);
    return res.status(500).json({ 
      message: error.message || `An error occurred while updating property with ID ${id}` 
    });
  }
};

// Delete property with role-based access control
const deleteProperty = async (req, res) => {
  const { id } = req.params;
  
  try {
    const auth0Id = req.auth.sub;
    const user = await User.findOne({ where: { auth0Id } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find the property
    const property = await Property.findByPk(id);
    
    if (!property) {
      return res.status(404).json({ message: `Property with ID ${id} not found` });
    }
    
    // Only Admin can delete properties
    if (user.role !== 'Admin') {
      return res.status(403).json({ 
        message: 'Access denied: Only administrators can delete properties' 
      });
    }
    
    // Delete the property
    await property.destroy();
    
    return res.status(200).json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error(`Error deleting property with ID ${id}:`, error);
    return res.status(500).json({ 
      message: error.message || `An error occurred while deleting property with ID ${id}` 
    });
  }
};

// Get all properties for an organization
const getOrganizationProperties = async (req, res) => {
  const { orgId } = req.params;
  
  try {
    const auth0Id = req.auth.sub;
    const user = await User.findOne({ where: { auth0Id } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user has permission to view properties from this organization
    if (user.role !== 'Admin' && user.orgId !== parseInt(orgId)) {
      return res.status(403).json({ 
        message: 'Access denied: You can only view properties from your organization' 
      });
    }
    
    // Check if organization exists
    const organization = await Organization.findByPk(orgId);
    if (!organization) {
      return res.status(404).json({ message: `Organization with ID ${orgId} not found` });
    }
    
    // Get properties for this organization
    const properties = await Property.findAll({
      where: { org_id: parseInt(orgId) }
    });
    
    // Parse JSON fields for each property
    const results = properties.map(property => {
      const plainProperty = property.get({ plain: true });
      
      return {
        ...plainProperty,
        identification: plainProperty.identification ? JSON.parse(plainProperty.identification) : null,
        zoning: plainProperty.zoning ? JSON.parse(plainProperty.zoning) : null,
        physical: plainProperty.physical ? JSON.parse(plainProperty.physical) : null,
        environmental: plainProperty.environmental ? JSON.parse(plainProperty.environmental) : null,
        accessibility: plainProperty.accessibility ? JSON.parse(plainProperty.accessibility) : null,
        // Parse financial data fields
        income: plainProperty.income ? JSON.parse(plainProperty.income) : null,
        expenses: plainProperty.expenses ? JSON.parse(plainProperty.expenses) : null,
        debt: plainProperty.debt ? JSON.parse(plainProperty.debt) : null,
        valuations: plainProperty.valuations ? JSON.parse(plainProperty.valuations) : null,
        // Parse tenant data
        tenants: plainProperty.tenants ? JSON.parse(plainProperty.tenants) : null,
        // Parse comps and adjustments data
        comps: plainProperty.comps ? JSON.parse(plainProperty.comps) : null,
        adjustments: plainProperty.adjustments ? JSON.parse(plainProperty.adjustments) : null,
      };
    });
    
    return res.status(200).json(results);
  } catch (error) {
    console.error(`Error retrieving properties for organization ${orgId}:`, error);
    return res.status(500).json({ 
      message: error.message || `An error occurred while retrieving properties for organization ${orgId}` 
    });
  }
};

module.exports = {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getOrganizationProperties
};
