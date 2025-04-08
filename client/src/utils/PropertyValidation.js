/**
 * Utility functions for property data validation
 */

// Market max rates by property type (in $ per square foot)
const MARKET_MAX_RATES = {
  'office': 75,
  'retail': 65,
  'industrial': 35,
  'multifamily': 50,
  'mixed-use': 70,
  'hospitality': 80,
  'healthcare': 85,
  'land': 25,
  'default': 100
};

// Standard cap rate range
const CAP_RATE_MIN = 0.05; // 5%
const CAP_RATE_MAX = 0.15; // 15%

// Flood zone types that require Phase I
const FLOOD_ZONES_REQUIRING_PHASE_I = ['A', 'AE', 'AH', 'AO', 'A1-30', 'A99', 'V', 'VE', 'V1-30'];

const PropertyValidation = {
  /**
   * Validates that net rentable area is greater than or equal to occupied space
   * 
   * @param {number} rentableArea - The net rentable area
   * @param {number} occupiedSpace - The occupied space
   * @returns {object} - Validation result
   */
  validateRentableArea: (rentableArea, occupiedSpace) => {
    const rentableAreaNum = parseFloat(rentableArea);
    const occupiedSpaceNum = parseFloat(occupiedSpace);
    
    if (isNaN(rentableAreaNum) || isNaN(occupiedSpaceNum)) {
      return { valid: true }; // Skip validation if values aren't numbers
    }
    
    if (rentableAreaNum < occupiedSpaceNum) {
      return {
        valid: false,
        message: 'Net Rentable Area must be greater than or equal to Occupied Space'
      };
    }
    
    return { valid: true };
  },
  
  /**
   * Validates that cap rate is between 5% and 15%
   * 
   * @param {number|string} capRate - The cap rate (as decimal or percentage)
   * @returns {object} - Validation result
   */
  validateCapRate: (capRate) => {
    if (!capRate && capRate !== 0) {
      return { valid: true }; // Skip validation if value isn't provided
    }
    
    let capRateNum = parseFloat(capRate);
    
    if (isNaN(capRateNum)) {
      return { valid: true }; // Skip validation if value isn't a number
    }
    
    // Convert percentage to decimal if needed
    if (capRateNum > 1) {
      capRateNum = capRateNum / 100;
    }
    
    if (capRateNum < CAP_RATE_MIN || capRateNum > CAP_RATE_MAX) {
      return {
        valid: false,
        message: `Cap Rate must be between ${CAP_RATE_MIN * 100}% and ${CAP_RATE_MAX * 100}%`,
        details: `The value ${(capRateNum * 100).toFixed(2)}% is outside the acceptable range.`
      };
    }
    
    return { valid: true };
  },
  
  /**
   * Validates that a Phase I report date is provided for properties in flood zones
   * 
   * @param {string} floodZone - The flood zone designation
   * @param {string} phaseIDate - The Phase I environmental report date
   * @returns {object} - Validation result
   */
  validateFloodZone: (floodZone, phaseIDate) => {
    if (!floodZone || floodZone === 'X' || floodZone === 'none' || floodZone === 'N/A') {
      return { valid: true }; // Skip validation for non-flood zones
    }
    
    // Check if the flood zone requires a Phase I report
    const requiresPhaseI = FLOOD_ZONES_REQUIRING_PHASE_I.includes(floodZone.toUpperCase()) || 
                         floodZone.toLowerCase().includes('flood');
    
    if (requiresPhaseI && !phaseIDate) {
      return {
        valid: false,
        message: 'Properties in a flood zone require a Phase I Environmental Report date',
        details: `Flood zone ${floodZone} requires documentation of environmental assessment.`
      };
    }
    
    return { valid: true };
  },
  
  /**
   * Validates that tenant PSF rent is less than or equal to market maximum for property type
   * 
   * @param {number|string} psfRent - The tenant's rent per square foot
   * @param {string} propertyType - The property type
   * @returns {object} - Validation result
   */
  validateTenantRent: (psfRent, propertyType) => {
    if (!psfRent) {
      return { valid: true }; // Skip validation if value isn't provided
    }
    
    const psfRentNum = parseFloat(psfRent);
    
    if (isNaN(psfRentNum)) {
      return { valid: true }; // Skip validation if value isn't a number
    }
    
    const maxRate = MARKET_MAX_RATES[propertyType?.toLowerCase()] || MARKET_MAX_RATES.default;
    
    if (psfRentNum > maxRate) {
      return {
        valid: false,
        message: `Tenant PSF Rent exceeds maximum market rate ($${maxRate}) for ${propertyType || 'this property type'}`,
        details: `The entered value ($${psfRentNum.toFixed(2)}) is above the typical market maximum.`
      };
    }
    
    return { valid: true };
  },
  
  /**
   * Run all validations on a property object
   * 
   * @param {object} property - The property data object
   * @returns {object} - Object containing all validation results
   */
  validatePropertyData: (property) => {
    const results = {};
    
    // Parse JSON strings if needed
    const physical = typeof property.physical === 'string' ? JSON.parse(property.physical) : property.physical || {};
    const valuations = typeof property.valuations === 'string' ? JSON.parse(property.valuations) : property.valuations || {};
    const environmental = typeof property.environmental === 'string' ? JSON.parse(property.environmental) : property.environmental || {};
    const identification = typeof property.identification === 'string' ? JSON.parse(property.identification) : property.identification || {};
    const tenants = typeof property.tenants === 'string' ? JSON.parse(property.tenants) : property.tenants || [];
    
    // 1. Net Rentable Area ≥ Occupied Space
    results.rentableArea = PropertyValidation.validateRentableArea(
      physical.total_rentable_area,
      physical.occupied_space
    );
    
    // 2. Cap Rate between 5%-15%
    results.capRate = PropertyValidation.validateCapRate(valuations.cap_rate);
    
    // 3. Flood Zone requires Phase I report date
    results.floodZone = PropertyValidation.validateFloodZone(
      environmental.flood_zone,
      environmental.phase_i_report_date
    );
    
    // 4. Tenant PSF Rent ≤ Market Max by Type
    results.tenantRents = [];
    if (Array.isArray(tenants)) {
      tenants.forEach((tenant, index) => {
        const result = PropertyValidation.validateTenantRent(
          tenant.psf_rent,
          identification.property_type
        );
        
        if (!result.valid) {
          results.tenantRents.push({
            ...result,
            tenantIndex: index,
            tenantName: tenant.tenant_name || `Tenant ${index + 1}`
          });
        }
      });
    }
    
    // Check if all validations passed
    results.allValid = results.rentableArea.valid && 
                      results.capRate.valid && 
                      results.floodZone.valid && 
                      results.tenantRents.length === 0;
    
    return results;
  }
};

export default PropertyValidation;
