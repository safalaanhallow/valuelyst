const XLSX = require('xlsx');
const path = require('path');
const db = require('../models');
const Property = db.properties;

// Function to import sales data from Excel file
const importSalesData = async () => {
  try {
    // Read the Excel file
    const filePath = path.join(__dirname, '../../Sales.xlsx');
    console.log('Looking for Sales.xlsx at:', filePath);
    
    if (!require('fs').existsSync(filePath)) {
      throw new Error(`Sales.xlsx file not found at ${filePath}`);
    }
    
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    console.log(`Found ${data.length} properties in Excel file`);
    
    // Process each property
    for (const row of data) {
      try {
        // Map Excel columns to our property structure
        const propertyData = {
          identification: JSON.stringify({
            property_name: row['Property Name'] || row['Name'] || row['Property'] || `Property ${Math.random().toString(36).substr(2, 9)}`,
            address: row['Address'] || row['Street'] || '',
            city: row['City'] || '',
            state: row['State'] || '',
            zip_code: row['ZIP'] || row['Zip Code'] || '',
            property_type: row['Property Type'] || row['Type'] || 'Commercial',
            sale_date: row['Sale Date'] || row['Date'] || new Date().toISOString().split('T')[0],
            latitude: '', // Default to empty as requested
            longitude: '' // Default to empty as requested
          }),
          physical: JSON.stringify({
            building_size: parseFloat(row['Building Size'] || row['Size'] || row['SF'] || 0) || 0,
            lot_size: parseFloat(row['Lot Size'] || row['Land Size'] || 0) || 0,
            total_rentable_area: parseFloat(row['Rentable Area'] || row['Building Size'] || row['Size'] || 0) || 0,
            occupied_space: parseFloat(row['Occupied'] || 0) || 0,
            year_built: parseInt(row['Year Built'] || row['Built'] || 0) || null,
            stories: parseInt(row['Stories'] || 1) || 1
          }),
          valuations: JSON.stringify({
            sale_price: parseFloat(row['Sale Price'] || row['Price'] || 0) || 0,
            price_per_sf: parseFloat(row['Price/SF'] || row['Price per SF'] || 0) || 0,
            cap_rate: parseFloat(row['Cap Rate'] || row['Cap'] || 0) || 0,
            assessed_value: parseFloat(row['Assessed Value'] || 0) || 0
          }),
          financials: JSON.stringify({
            gross_rental_income: parseFloat(row['Gross Income'] || 0) || 0,
            net_operating_income: parseFloat(row['NOI'] || 0) || 0,
            operating_expenses: parseFloat(row['Operating Expenses'] || 0) || 0
          }),
          comps: JSON.stringify([]),
          adjustments: JSON.stringify({}),
          zoning: JSON.stringify({
            zoning_classification: row['Zoning'] || '',
            permitted_uses: row['Allowed Uses'] || ''
          }),
          tenants: JSON.stringify([]),
          // Use default org_id of 1 for now - in production this should be dynamic
          org_id: 1,
          created_by: 1
        };

        // Create the property
        await Property.create(propertyData);
        console.log(`Imported: ${propertyData.identification.property_name || 'Unnamed Property'}`);
        
      } catch (error) {
        console.error('Error importing property:', error);
      }
    }
    
    console.log('Sales data import completed successfully');
    
  } catch (error) {
    console.error('Error importing sales data:', error);
    throw error;
  }
};

// Run the import if this script is executed directly
if (require.main === module) {
  importSalesData()
    .then(() => {
      console.log('Import completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Import failed:', error);
      process.exit(1);
    });
}

module.exports = { importSalesData };
