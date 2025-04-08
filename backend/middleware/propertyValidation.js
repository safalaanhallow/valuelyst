const db = require('../models');
const Property = db.properties;

/**
 * Middleware for advanced property validation rules
 */
const propertyValidation = {
  // Validate critical fields for property creation/update
  validateCriticalFields: async (req, res, next) => {
    try {
      const propertyData = req.body;
      const validationErrors = [];

      // 1. Net Rentable Area ≥ Occupied Space
      if (propertyData.physical) {
        const physical = typeof propertyData.physical === 'string' 
          ? JSON.parse(propertyData.physical) 
          : propertyData.physical;

        if (physical.total_rentable_area && physical.occupied_space) {
          const rentableArea = parseFloat(physical.total_rentable_area);
          const occupiedSpace = parseFloat(physical.occupied_space);

          if (!isNaN(rentableArea) && !isNaN(occupiedSpace) && rentableArea < occupiedSpace) {
            validationErrors.push({
              field: 'physical.total_rentable_area',
              message: 'Net Rentable Area must be greater than or equal to Occupied Space'
            });
          }
        }
      }

      // 2. Cap Rate between 5%-15%
      if (propertyData.valuations) {
        const valuations = typeof propertyData.valuations === 'string'
          ? JSON.parse(propertyData.valuations)
          : propertyData.valuations;

        if (valuations.cap_rate) {
          const capRate = parseFloat(valuations.cap_rate);
          if (!isNaN(capRate)) {
            // Convert percentage to decimal if needed
            const normalizedCapRate = capRate > 1 ? capRate / 100 : capRate;
            
            if (normalizedCapRate < 0.05 || normalizedCapRate > 0.15) {
              validationErrors.push({
                field: 'valuations.cap_rate',
                message: 'Cap Rate must be between 5% and 15%'
              });
            }
          }
        }
      }

      // 3. Flood Zone requires Phase I report date
      if (propertyData.environmental) {
        const environmental = typeof propertyData.environmental === 'string'
          ? JSON.parse(propertyData.environmental)
          : propertyData.environmental;

        if (environmental.flood_zone && 
            environmental.flood_zone !== 'X' && 
            environmental.flood_zone !== 'none' && 
            environmental.flood_zone !== 'N/A') {
          
          if (!environmental.phase_i_report_date) {
            validationErrors.push({
              field: 'environmental.phase_i_report_date',
              message: 'Properties in a flood zone require a Phase I Environmental Report date'
            });
          }
        }
      }

      // 4. Tenant PSF Rent ≤ Market Max by Type
      if (propertyData.tenants) {
        const tenants = typeof propertyData.tenants === 'string'
          ? JSON.parse(propertyData.tenants)
          : propertyData.tenants;

        // Get property type for market rate comparison
        let propertyType = '';
        if (propertyData.identification) {
          const identification = typeof propertyData.identification === 'string'
            ? JSON.parse(propertyData.identification)
            : propertyData.identification;
          propertyType = identification.property_type || '';
        }

        // Market max rates by property type (in $ per square foot)
        const marketMaxRates = {
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

        const maxRate = marketMaxRates[propertyType.toLowerCase()] || marketMaxRates.default;

        // Validate each tenant's PSF rent
        if (Array.isArray(tenants)) {
          tenants.forEach((tenant, index) => {
            if (tenant.psf_rent) {
              const psfRent = parseFloat(tenant.psf_rent);
              if (!isNaN(psfRent) && psfRent > maxRate) {
                validationErrors.push({
                  field: `tenants[${index}].psf_rent`,
                  message: `Tenant PSF Rent exceeds maximum market rate ($${maxRate}) for ${propertyType || 'this property type'}`
                });
              }
            }
          });
        }
      }

      if (validationErrors.length > 0) {
        return res.status(400).json({
          message: 'Property validation failed',
          errors: validationErrors
        });
      }

      next();
    } catch (error) {
      console.error('Property validation error:', error);
      res.status(500).json({
        message: 'Error during property validation',
        error: error.message
      });
    }
  },

  // Validate comps data during import
  validateCompsData: (req, res, next) => {
    try {
      const { mappings } = req.body;
      const validationErrors = [];

      // Check cap rate validation for comps
      if (mappings && mappings.cap_rate) {
        req.validateCapRate = true;
      }

      // Check rentable area validation for comps
      if (mappings && mappings.total_rentable_area && mappings.occupied_space) {
        req.validateRentableArea = true;
      }

      // Add flags to request for processing in the next middleware
      req.validationFlags = {
        validateCapRate: mappings && mappings.cap_rate ? true : false,
        validateRentableArea: mappings && mappings.total_rentable_area && mappings.occupied_space ? true : false,
        validateFloodZone: mappings && mappings.flood_zone && mappings.phase_i_report_date ? true : false,
        validateTenantRent: mappings && mappings.psf_rent && mappings.property_type ? true : false
      };

      next();
    } catch (error) {
      console.error('Comps validation error:', error);
      res.status(500).json({
        message: 'Error during comps validation',
        error: error.message
      });
    }
  }
};

module.exports = propertyValidation;
