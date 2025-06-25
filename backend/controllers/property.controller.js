const db = require('../models');
const Property = db.property;
const User = db.user;
const Organization = db.organization;

// Import comprehensive appraisal engine
const AppraisalEngine = require('../services/appraisal/appraisalEngine');

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
      adjustments: property.adjustments ? JSON.parse(property.adjustments) : null,
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

// Get available comps for selection
const getAvailableComps = async (req, res) => {
  try {
    const { Sequelize } = require('sequelize');
    const path = require('path');
    
    const sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, '../database/valuelyst.sqlite'),
      logging: false
    });
    
    const SalesProperty = sequelize.define('sales_property', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      property_id: Sequelize.STRING,
      property_name: Sequelize.STRING,
      address: Sequelize.STRING,
      city: Sequelize.STRING,
      state: Sequelize.STRING,
      tax_id: Sequelize.STRING,
      sale_price: Sequelize.DECIMAL(15, 2),
      sale_date: Sequelize.STRING,
      building_size: Sequelize.DECIMAL(10, 2),
      lot_size: Sequelize.DECIMAL(10, 2),
      cap_rate: Sequelize.DECIMAL(5, 2),
      price_per_sf: Sequelize.DECIMAL(10, 2),
      property_type: Sequelize.STRING,
      raw_data: Sequelize.JSON
    }, {
      tableName: 'sales_properties',
      timestamps: true
    });
    
    await SalesProperty.sync();

    const comps = await SalesProperty.findAll({
      attributes: ['id', 'property_id', 'property_name', 'address', 'city', 'state', 'tax_id', 'sale_price', 'sale_date', 'building_size', 'lot_size', 'cap_rate', 'price_per_sf', 'property_type', 'raw_data'],
      limit: 250,
      order: [['sale_date', 'DESC']]
    });

    const results = comps.map(comp => {
      const plainComp = comp.get({ plain: true });
      return {
        ...plainComp,
        raw_data: typeof plainComp.raw_data === 'string' ? JSON.parse(plainComp.raw_data) : plainComp.raw_data
      };
    });

    res.status(200).json({ comps: results });
  } catch (error) {
    console.error('Error fetching available comps:', error);
    res.status(500).json({ message: 'Error fetching available comps', error: error.message });
  }
};

// Helper function to build subject property object
function buildSubjectProperty(subjectPropertyData, propertyId) {
  return {
    id: propertyId || 999,
    propertyId: `SUBJ-${propertyId || 999}`,
    propertyType: subjectPropertyData?.propertyType || "Office",
    physical: {
      buildingArea: {
        grossBuildingArea: subjectPropertyData?.buildingSize || 15000,
        netRentableArea: subjectPropertyData?.netRentableArea || 13500
      },
      landArea: {
        sf: subjectPropertyData?.lotSize || 8000,
        acres: (subjectPropertyData?.lotSize || 8000) / 43560
      },
      construction: {
        yearBuilt: subjectPropertyData?.yearBuilt || 2018,
        constructionType: "steel_frame",
        exteriorFinish: "glass",
        condition: "good"
      },
      stories: 3,
      ceilingHeight: 9,
      parkingSpaces: 60
    },
    location: {
      address: subjectPropertyData?.address || "789 Test Subject Property Ave",
      city: subjectPropertyData?.city || "Business City",
      state: subjectPropertyData?.state || "ST",
      zipCode: subjectPropertyData?.zipCode || "12345",
      neighborhood: "A-",
      market: "Primary"
    },
    legal: {
      propertyRights: "Fee Simple",
      zoning: "Commercial Office",
      easements: [],
      restrictions: []
    },
    income: {
      grossIncome: subjectPropertyData?.grossIncome || 450000,
      vacancy: 0.05,
      operatingExpenses: subjectPropertyData?.operatingExpenses || 157500,
      netOperatingIncome: subjectPropertyData?.netOperatingIncome || 270000
    },
    occupancy: "Owner Occupied",
    condition: "Good"
  };
}

// Helper function to transform database comparables to appraisal format
function transformComparables(selectedComps) {
  return selectedComps.map(comp => ({
    id: comp.id,
    propertyId: comp.property_id,
    propertyName: comp.property_name,
    address: comp.address,
    city: comp.city,
    state: comp.state,
    taxId: comp.tax_id,
    salePrice: parseFloat(comp.sale_price),
    saleDate: comp.sale_date,
    buildingSize: parseFloat(comp.building_size),
    lotSize: parseFloat(comp.lot_size) || 0,
    propertyType: comp.property_type,
    yearBuilt: 2015, // Default since not in database
    pricePerSF: parseFloat(comp.price_per_sf),
    capRate: parseFloat(comp.cap_rate) || 0.08,
    annualNetIncome: null, // Not in database
    physical: {
      buildingArea: {
        grossBuildingArea: parseFloat(comp.building_size)
      },
      landArea: {
        sf: parseFloat(comp.lot_size) || 0
      },
      construction: {
        yearBuilt: 2015, // Default since not in database
        condition: "average"
      }
    },
    location: {
      address: comp.address,
      city: comp.city,
      state: comp.state,
      neighborhood: "B"
    },
    marketConditions: "typical",
    propertyRights: "fee_simple",
    financing: "conventional"
  }));
}

// Helper function to build market data from comparables
function buildMarketData(selectedComps) {
  const prices = selectedComps.map(comp => parseFloat(comp.sale_price)).filter(price => price > 0);
  const capRates = selectedComps.map(comp => parseFloat(comp.cap_rate)).filter(rate => rate > 0);
  
  return {
    pricing: {
      average: prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 2000000,
      median: prices.length > 0 ? prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)] : 2000000,
      range: {
        low: prices.length > 0 ? Math.min(...prices) : 1500000,
        high: prices.length > 0 ? Math.max(...prices) : 2500000
      }
    },
    capRates: {
      average: capRates.length > 0 ? capRates.reduce((a, b) => a + b, 0) / capRates.length : 0.08,
      range: {
        low: capRates.length > 0 ? Math.min(...capRates) : 0.07,
        high: capRates.length > 0 ? Math.max(...capRates) : 0.09
      }
    },
    marketConditions: "balanced",
    trends: "stable",
    vacancy: 0.05,
    expenseRatio: 0.35,
    constructionCost: 180 // per square foot
  };
}

// Helper functions for appraisal generation
const buildSubjectPropertyHelper = (subjectPropertyData, propertyId) => {
  return {
    id: propertyId || subjectPropertyData.id,
    address: subjectPropertyData.address || '',
    city: subjectPropertyData.city || '',
    state: subjectPropertyData.state || '',
    propertyType: subjectPropertyData.propertyType || 'Commercial',
    buildingSize: subjectPropertyData.buildingSize || 0,
    lotSize: subjectPropertyData.lotSize || 0,
    yearBuilt: subjectPropertyData.yearBuilt || 0,
    ...subjectPropertyData
  };
};

const transformComparablesHelper = (selectedComps) => {
  return selectedComps.map(comp => {
    const plainComp = comp.get({ plain: true });
    return {
      id: plainComp.id,
      address: plainComp.address || '',
      city: plainComp.city || '',
      state: plainComp.state || '',
      salePrice: plainComp.sale_price || 0,
      saleDate: plainComp.sale_date || '',
      buildingSize: plainComp.building_size || 0,
      lotSize: plainComp.lot_size || 0,
      propertyType: plainComp.property_type || 'Commercial',
      capRate: plainComp.cap_rate || 0,
      pricePerSF: plainComp.price_per_sf || 0
    };
  });
};

const buildMarketDataHelper = (selectedComps) => {
  const salePrices = selectedComps.map(comp => comp.sale_price || 0).filter(price => price > 0);
  const capRates = selectedComps.map(comp => comp.cap_rate || 0).filter(rate => rate > 0);
  
  return {
    avgSalePrice: salePrices.length > 0 ? salePrices.reduce((sum, price) => sum + price, 0) / salePrices.length : 0,
    avgCapRate: capRates.length > 0 ? capRates.reduce((sum, rate) => sum + rate, 0) / capRates.length : 0,
    marketTrends: 'Stable', // Default value
    comparableCount: selectedComps.length
  };
};

// Generate commercial property appraisal using comprehensive USPAP-compliant engine
const generateAppraisal = async (req, res) => {
  try {
    const { propertyId, selectedCompIds, adjustments, subjectPropertyData } = req.body;
    
    console.log('🏢 Generating comprehensive commercial appraisal...');
    console.log('Selected comp IDs:', selectedCompIds);
    
    // Connect to database
    const { Sequelize } = require('sequelize');
    const path = require('path');
    
    const sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, '../database/valuelyst.sqlite'),
      logging: false
    });
    
    const SalesProperty = sequelize.define('sales_property', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      property_id: Sequelize.STRING,
      property_name: Sequelize.STRING,
      address: Sequelize.STRING,
      city: Sequelize.STRING,
      state: Sequelize.STRING,
      tax_id: Sequelize.STRING,
      sale_price: Sequelize.DECIMAL(15, 2),
      sale_date: Sequelize.STRING,
      building_size: Sequelize.DECIMAL(10, 2),
      lot_size: Sequelize.DECIMAL(10, 2),
      cap_rate: Sequelize.DECIMAL(5, 2),
      price_per_sf: Sequelize.DECIMAL(10, 2),
      property_type: Sequelize.STRING
    }, {
      tableName: 'sales_properties',
      timestamps: true
    });
    
    // Get selected comparable properties from database
    const selectedComps = await SalesProperty.findAll({
      where: {
        id: { [Sequelize.Op.in]: selectedCompIds }
      }
    });
    
    console.log(`📊 Found ${selectedComps.length} comparable properties from database`);
    
    if (selectedComps.length < 3) {
      return res.status(400).json({
        message: 'At least 3 comparable properties are required for appraisal'
      });
    }

    // Create comprehensive subject property object
    const subjectProperty = buildSubjectPropertyHelper(subjectPropertyData, propertyId);
    
    // Transform database comparables to appraisal format
    const comparables = transformComparablesHelper(selectedComps);
    
    // Prepare market data
    const marketData = buildMarketDataHelper(selectedComps);
    
    // Initialize the comprehensive appraisal engine
    const appraisalEngine = new AppraisalEngine();
    
    // Generate comprehensive appraisal
    const appraisalResults = await appraisalEngine.generateAppraisal(
      subjectProperty,
      comparables,
      marketData,
      {
        userAdjustments: adjustments,
        includeAllApproaches: true,
        generateDetailedReport: true,
        uspapCompliance: true
      }
    );
    
    // Format response for frontend
    const response = {
      success: true,
      message: 'Comprehensive appraisal generated successfully',
      appraisal: {
        subjectProperty,
        comparables: comparables.map(comp => ({
          ...comp,
          userAdjustments: adjustments[comp.id] || {}
        })),
        valuationSummary: {
          finalValue: appraisalResults.reconciliation.finalValue,
          valueRange: appraisalResults.reconciliation.valueRange,
          confidence: appraisalResults.reconciliation.confidence,
          approaches: {
            salesComparison: appraisalResults.reconciliation.approaches.salesComparison ? {
              valueIndication: appraisalResults.reconciliation.approaches.salesComparison.valueIndication,
              reliability: appraisalResults.reconciliation.reliability.salesComparison?.level,
              weight: Math.round(appraisalResults.reconciliation.weights.sales * 100)
            } : null,
            incomeApproach: appraisalResults.reconciliation.approaches.incomeApproach ? {
              valueIndication: appraisalResults.reconciliation.approaches.incomeApproach.valueIndication,
              reliability: appraisalResults.reconciliation.reliability.incomeApproach?.level,
              weight: Math.round(appraisalResults.reconciliation.weights.income * 100)
            } : null,
            costApproach: appraisalResults.reconciliation.approaches.costApproach ? {
              valueIndication: appraisalResults.reconciliation.approaches.costApproach.valueIndication,
              reliability: appraisalResults.reconciliation.reliability.costApproach?.level,
              weight: Math.round(appraisalResults.reconciliation.weights.cost * 100)
            } : null
          },
          reconciliation: {
            weightingRationale: appraisalResults.reconciliation.narrative.weightingRationale,
            varianceAnalysis: appraisalResults.reconciliation.narrative.varianceAnalysis,
            conclusion: appraisalResults.reconciliation.narrative.conclusion
          }
        },
        qualityAssurance: {
          validationResults: appraisalResults.validation || {},
          dataCompleteness: appraisalResults.validation?.dataCompleteness || {},
          recommendations: appraisalResults.validation?.recommendations || []
        },
        professionalReport: appraisalResults.report,
        analysisDate: new Date().toISOString(),
        metadata: {
          engineVersion: '1.0.0',
          uspapCompliant: true,
          approaches: Object.keys(appraisalResults.reconciliation.approaches).length,
          comparablesUsed: comparables.length
        }
      }
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('❌ Error generating comprehensive appraisal:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while generating the appraisal',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

module.exports = {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getOrganizationProperties,
  getAvailableComps,
  generateAppraisal
};
