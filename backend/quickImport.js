const XLSX = require('xlsx');
const path = require('path');
const db = require('./models');
const Property = db.properties;

async function quickImport() {
  try {
    console.log('🚀 Starting quick import of first 100 properties...');
    
    // Read Excel file
    const filePath = path.join(__dirname, '../Sales.xlsx');
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`📊 Found ${data.length} total rows in Excel file`);
    console.log(`📝 Column headers:`, Object.keys(data[0] || {}));
    
    // Take only first 100 rows
    const limitedData = data.slice(0, 100);
    console.log(`⚡ Processing first ${limitedData.length} rows...`);
    
    let imported = 0;
    let errors = 0;
    
    for (let i = 0; i < limitedData.length; i++) {
      const row = limitedData[i];
      
      try {
        const propertyData = {
          identification: JSON.stringify({
            property_name: row['Property Name'] || `Property ${i + 1}`,
            address: row['Address'] || '',
            city: row['City'] || '',
            state: row['State'] || '',
            latitude: '', // Empty as requested
            longitude: '' // Empty as requested
          }),
          physical: JSON.stringify({
            building_size: parseFloat(row['Building Size'] || 0) || 0,
            lot_size: parseFloat(row['Lot Size'] || 0) || 0
          }),
          valuations: JSON.stringify({
            sale_price: parseFloat(row['Sale Price'] || 0) || 0,
            price_per_sf: parseFloat(row['Price/SF'] || 0) || 0,
            cap_rate: parseFloat(row['Cap Rate'] || 0) || 0
          }),
          financials: JSON.stringify({}),
          comps: JSON.stringify([]),
          adjustments: JSON.stringify({}),
          zoning: JSON.stringify({}),
          tenants: JSON.stringify([]),
          org_id: 1,
          created_by: 1
        };

        await Property.create(propertyData);
        imported++;
        
        if (imported % 10 === 0) {
          console.log(`✅ Imported ${imported} properties...`);
        }
        
      } catch (error) {
        errors++;
        console.log(`❌ Error importing row ${i + 1}:`, error.message);
      }
    }
    
    console.log(`🎉 Import complete! Imported: ${imported}, Errors: ${errors}`);
    
  } catch (error) {
    console.error('💥 Import failed:', error.message);
  } finally {
    process.exit(0);
  }
}

quickImport();
