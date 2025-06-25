const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const XLSX = require('xlsx');
const db = require('../models');
const Property = db.properties;
const User = db.users;
const multer = require('multer');

// Set up multer storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// File filter to accept CSV and Excel files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'text/csv' || 
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.originalname.endsWith('.csv') ||
      file.originalname.endsWith('.xlsx') ||
      file.originalname.endsWith('.xls')) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV and Excel files are allowed'), false);
  }
};

// Configure multer upload
const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Middleware for handling file uploads
const uploadMiddleware = upload.single('file');

// Controller methods
const importController = {
  // Upload CSV file
  uploadCompsCSV: (req, res) => {
    uploadMiddleware(req, res, async (err) => {
      if (err) {
        return res.status(400).send({ message: `Upload error: ${err.message}` });
      }
      
      if (!req.file) {
        return res.status(400).send({ message: 'Please upload a CSV or Excel file' });
      }
      
      try {
        res.status(200).send({
          message: 'File uploaded successfully',
          filename: req.file.filename,
          originalname: req.file.originalname,
          size: req.file.size,
          path: req.file.path
        });
      } catch (error) {
        res.status(500).send({ message: `Error uploading file: ${error.message}` });
      }
    });
  },
  
  // Process uploaded CSV
  processCompsCSV: async (req, res) => {
    try {
      const { filename, propertyId, mappings } = req.body;
      
      if (!filename || !propertyId || !mappings) {
        return res.status(400).send({ message: 'Missing required parameters' });
      }
      
      // Get the property to update
      const property = await Property.findByPk(propertyId);
      if (!property) {
        return res.status(404).send({ message: 'Property not found' });
      }
      
      const filePath = path.join(__dirname, '../uploads', filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).send({ message: 'File not found' });
      }
      
      let records = [];
      let validationIssues = [];
      
      if (filename.endsWith('.csv')) {
        // Parse CSV file and process data
        const parser = fs
          .createReadStream(filePath)
          .pipe(
            parse({
              columns: true,
              skip_empty_lines: true,
              trim: true
            })
          );
        
        // Get validation flags from middleware
        const { validateCapRate, validateRentableArea, validateFloodZone, validateTenantRent } = req.validationFlags || {};
        
        for await (const record of parser) {
          // Apply field mappings
          const mappedRecord = {};
          
          Object.keys(mappings).forEach(targetField => {
            const sourceField = mappings[targetField];
            if (sourceField && record[sourceField] !== undefined) {
              mappedRecord[targetField] = record[sourceField];
            }
          });
          
          // Only add records that have at least some data
          if (Object.keys(mappedRecord).length > 0) {
            // Generate a unique ID for each comp
            mappedRecord.id = Date.now() + '-' + Math.floor(Math.random() * 1000);
            
            // Perform validations on the record if needed
            if (validateCapRate) {
              const capRate = parseFloat(mappedRecord.cap_rate);
              if (!isNaN(capRate)) {
                // Convert percentage to decimal if needed
                const normalizedCapRate = capRate > 1 ? capRate / 100 : capRate;
                
                if (normalizedCapRate < 0.05 || normalizedCapRate > 0.15) {
                  validationIssues.push({
                    recordIndex: records.length,
                    propertyName: mappedRecord.property_name || `Record ${records.length + 1}`,
                    field: 'cap_rate',
                    value: mappedRecord.cap_rate,
                    message: `Cap Rate must be between 5% and 15%`
                  });
                }
              }
            }
            
            if (validateRentableArea) {
              const rentableArea = parseFloat(mappedRecord.total_rentable_area);
              const occupiedSpace = parseFloat(mappedRecord.occupied_space);
              
              if (!isNaN(rentableArea) && !isNaN(occupiedSpace) && rentableArea < occupiedSpace) {
                validationIssues.push({
                  recordIndex: records.length,
                  propertyName: mappedRecord.property_name || `Record ${records.length + 1}`,
                  field: 'total_rentable_area',
                  value: mappedRecord.total_rentable_area,
                  message: `Net Rentable Area must be greater than or equal to Occupied Space (${occupiedSpace})`
                });
              }
            }
            
            records.push(mappedRecord);
          }
        }
      } else if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
        // Parse Excel file and process data
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        // Get validation flags from middleware
        const { validateCapRate, validateRentableArea, validateFloodZone, validateTenantRent } = req.validationFlags || {};
        
        data.forEach((record, index) => {
          // Apply field mappings
          const mappedRecord = {};
          
          Object.keys(mappings).forEach(targetField => {
            const sourceField = mappings[targetField];
            if (sourceField && record[sourceField] !== undefined) {
              mappedRecord[targetField] = record[sourceField];
            }
          });
          
          // Only add records that have at least some data
          if (Object.keys(mappedRecord).length > 0) {
            // Generate a unique ID for each comp
            mappedRecord.id = Date.now() + '-' + Math.floor(Math.random() * 1000);
            
            // Perform validations on the record if needed
            if (validateCapRate) {
              const capRate = parseFloat(mappedRecord.cap_rate);
              if (!isNaN(capRate)) {
                // Convert percentage to decimal if needed
                const normalizedCapRate = capRate > 1 ? capRate / 100 : capRate;
                
                if (normalizedCapRate < 0.05 || normalizedCapRate > 0.15) {
                  validationIssues.push({
                    recordIndex: index,
                    propertyName: mappedRecord.property_name || `Record ${index + 1}`,
                    field: 'cap_rate',
                    value: mappedRecord.cap_rate,
                    message: `Cap Rate must be between 5% and 15%`
                  });
                }
              }
            }
            
            if (validateRentableArea) {
              const rentableArea = parseFloat(mappedRecord.total_rentable_area);
              const occupiedSpace = parseFloat(mappedRecord.occupied_space);
              
              if (!isNaN(rentableArea) && !isNaN(occupiedSpace) && rentableArea < occupiedSpace) {
                validationIssues.push({
                  recordIndex: index,
                  propertyName: mappedRecord.property_name || `Record ${index + 1}`,
                  field: 'total_rentable_area',
                  value: mappedRecord.total_rentable_area,
                  message: `Net Rentable Area must be greater than or equal to Occupied Space (${occupiedSpace})`
                });
              }
            }
            
            records.push(mappedRecord);
          }
        });
      }
      
      // Check if there are validation issues
      if (validationIssues.length > 0) {
        // We'll still import the data but warn about validation issues
        console.log(`Found ${validationIssues.length} validation issues in imported comps`);
      }
      
      // Update property with new comps
      const existingComps = property.comps ? JSON.parse(property.comps) : [];
      const updatedComps = [...existingComps, ...records];
      
      await property.update({
        comps: JSON.stringify(updatedComps),
        updated_by: req.userId
      });
      
      // Clean up the uploaded file
      fs.unlinkSync(filePath);
      
      res.status(200).send({
        message: validationIssues.length > 0 ? 
          `Comps imported with ${validationIssues.length} validation warnings` : 
          'Comps imported successfully',
        count: records.length,
        property_id: propertyId,
        validationIssues: validationIssues.length > 0 ? validationIssues : undefined
      });
    } catch (error) {
      res.status(500).send({ message: `Error processing file: ${error.message}` });
    }
  },
  
  // Preview CSV file columns
  previewCSVColumns: async (req, res) => {
    try {
      const { filename } = req.params;
      
      if (!filename) {
        return res.status(400).send({ message: 'Filename is required' });
      }
      
      const filePath = path.join(__dirname, '../uploads', filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).send({ message: 'File not found' });
      }
      
      let columns = [];
      let records = [];
      
      if (filename.endsWith('.csv')) {
        // Read first few rows to get column headers and sample data
        const parser = fs
          .createReadStream(filePath)
          .pipe(
            parse({
              columns: true,
              skip_empty_lines: true,
              trim: true,
              to: 5 // Read only first 5 rows for preview
            })
          );
        
        for await (const record of parser) {
          if (records.length === 0) {
            columns = Object.keys(record);
          }
          records.push(record);
        }
      } else if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
        // Parse Excel file and process data
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        columns = Object.keys(data[0]);
        records = data.slice(0, 5);
      }
      
      res.status(200).send({
        columns,
        previewData: records,
        filename
      });
    } catch (error) {
      res.status(500).send({ message: `Error previewing file: ${error.message}` });
    }
  },
  
  // Get default field mappings for comps
  getDefaultMappings: (req, res) => {
    // Default property fields for comps mapping
    const defaultMappings = {
      // Identification fields
      property_name: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      county: '',
      property_type: '',
      sub_type: '',
      apn: '',
      
      // Physical attributes
      year_built: '',
      building_class: '',
      total_building_sf: '',
      lot_size_sf: '',
      lot_size_acres: '',
      stories: '',
      occupancy_rate: '',
      parking_ratio: '',
      
      // Financial metrics
      price: '',
      price_per_sf: '',
      cap_rate: '',
      noi: '',
      potential_gross_income: '',
      effective_gross_income: '',
      vacancy_rate: '',
      operating_expenses: '',
      
      // Transaction data
      sale_date: '',
      sale_type: '',
      days_on_market: '',
      seller: '',
      buyer: '',
      transaction_type: '',
      financing: '',
      
      // Location attributes
      latitude: '',
      longitude: '',
      market: '',
      submarket: '',
      msa: '',
      traffic_count: '',
      walkability_score: '',
      
      // Additional fields
      condition: '',
      quality: '',
      notes: '',
      
      // URLs for external resources
      image_url: '',
      source_url: ''
    };
    
    res.status(200).send(defaultMappings);
  },
  
  // Get available target fields (all possible fields in the property model that can be mapped)
  getAvailableTargetFields: (req, res) => {
    // Generate a comprehensive list of all fields that can be used in comps
    const targetFields = {
      // Identification fields
      identification: [
        'property_name', 'address', 'address_2', 'city', 'state', 'zip_code', 'county', 
        'country', 'property_type', 'sub_type', 'apn', 'fips', 'tax_id', 'legal_description',
        'primary_use', 'secondary_use', 'year_built', 'property_status', 'ownership_type'
      ],
      
      // Physical attributes
      physical: [
        'total_building_sf', 'total_land_sf', 'lot_size_acres', 'building_class', 'stories',
        'typical_floor_size', 'ceiling_height', 'year_renovated', 'construction_type',
        'structural_system', 'exterior_finish', 'roof_type', 'hvac_system', 'sprinkler_system',
        'elevators', 'parking_spaces', 'parking_ratio', 'loading_docks', 'condition',
        'quality', 'amenities', 'ada_compliant', 'energy_star_rated', 'leed_certification',
        'seismic_zone', 'units_count', 'avg_unit_size', 'bedroom_count', 'bathroom_count',
        'floor_plans', 'occupancy_rate', 'occupied_sf', 'vacant_sf', 'anchor_tenants',
        'building_footprint', 'frontage', 'depth', 'shape', 'topography', 'utilities_available',
        'landscaping', 'pylon_signage', 'monument_signage', 'building_signage'
      ],
      
      // Financial metrics
      financial: [
        'price', 'price_per_sf', 'cap_rate', 'noi', 'potential_gross_income',
        'effective_gross_income', 'total_operating_expenses', 'expense_ratio',
        'vacancy_rate', 'vacancy_allowance', 'tax_expenses', 'insurance_expenses',
        'cam_expenses', 'management_fee', 'replacement_reserves', 'utilities_expenses',
        'asking_rent_psf', 'lease_type', 'lease_term', 'rent_escalations', 
        'ti_allowance', 'leasing_commission', 'expense_stops', 'expense_recovery',
        'sale_price', 'sale_date', 'sale_type', 'buyer', 'seller', 'listing_broker',
        'selling_broker', 'days_on_market', 'transaction_type', 'financing', 'loan_amount',
        'loan_to_value', 'interest_rate', 'loan_term', 'amortization', 'debt_service',
        'debt_coverage_ratio', 'cash_on_cash_return', 'internal_rate_of_return',
        'equity_multiple'
      ],
      
      // Location attributes
      location: [
        'latitude', 'longitude', 'market', 'submarket', 'msa', 'cbsa', 'neighborhood',
        'traffic_count', 'closest_highway', 'highway_distance', 'closest_airport',
        'airport_distance', 'closest_port', 'port_distance', 'public_transportation',
        'walkability_score', 'bike_score', 'transit_score', 'schools', 'school_district',
        'zoning', 'zoning_description', 'enterprise_zone', 'opportunity_zone',
        'special_districts', 'flood_zone', 'environmental_issues'
      ],
      
      // Transaction details
      transaction: [
        'recording_date', 'document_type', 'document_number', 'book', 'page',
        'consideration', 'transfer_tax', 'mortgage_amount', 'mortgage_type',
        'mortgage_term', 'mortgage_rate', 'mortgage_date', 'prior_sale_date',
        'prior_sale_price', 'deed_restriction', 'easements', 'verification_source',
        'verification_date', 'verification_type', 'confirmation_source'
      ]
    };

    // Flatten categories into a list of fields with their categories
    const fieldList = [];
    Object.keys(targetFields).forEach(category => {
      targetFields[category].forEach(field => {
        fieldList.push({
          field,
          category
        });
      });
    });
    
    res.status(200).send({
      categories: targetFields,
      fields: fieldList
    });
  }
};

module.exports = importController;
