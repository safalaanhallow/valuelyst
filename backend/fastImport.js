console.log("Starting import...");

const XLSX = require('xlsx');
const db = require('./models');

async function runImport() {
  try {
    console.log("✅ Reading Excel file...");
    const workbook = XLSX.readFile('../Sales.xlsx');
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    console.log(`✅ Found ${data.length} rows`);
    
    console.log("✅ Connecting to database...");
    await db.sequelize.authenticate();
    console.log("✅ Database connected");
    
    // Import just 5 properties to test
    const testData = data.slice(0, 5);
    console.log(`✅ Importing ${testData.length} test properties...`);
    
    for (let i = 0; i < testData.length; i++) {
      const row = testData[i];
      console.log(`📝 Processing row ${i + 1}: ${row['Property Name'] || 'Unnamed'}`);
      
      await db.properties.create({
        identification: JSON.stringify({
          property_name: row['Property Name'] || `Test Property ${i + 1}`,
          address: row['Address'] || 'Test Address',
          latitude: '',
          longitude: ''
        }),
        physical: JSON.stringify({
          building_size: parseFloat(row['Building Size']) || 1000
        }),
        valuations: JSON.stringify({
          sale_price: parseFloat(row['Sale Price']) || 100000
        }),
        financials: JSON.stringify({}),
        comps: JSON.stringify([]),
        adjustments: JSON.stringify({}),
        zoning: JSON.stringify({}),
        tenants: JSON.stringify([]),
        org_id: 1,
        created_by: 1
      });
      
      console.log(`✅ Imported property ${i + 1}`);
    }
    
    console.log("🎉 IMPORT COMPLETED SUCCESSFULLY!");
    
  } catch (error) {
    console.error("❌ ERROR:", error.message);
  }
  
  process.exit(0);
}

runImport();
