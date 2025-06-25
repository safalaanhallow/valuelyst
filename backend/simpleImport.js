const XLSX = require('xlsx');
const { Sequelize } = require('sequelize');
const path = require('path');

// Simple database setup
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database/valuelyst.sqlite'),
  logging: false
});

// Simple property model just for import
const Property = sequelize.define('sales_property', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
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
  raw_data: Sequelize.JSON // Catch-all for all columns from Excel
}, {
  tableName: 'sales_properties',
  timestamps: true
});

const cliProgress = require('cli-progress');

async function importSalesData() {
  try {
    console.log('🚀 Starting Sales.xlsx import...');
    
    await sequelize.authenticate();
    await Property.sync({ force: true });
    console.log('✅ Database connection ready and table created.');
    
    const filePath = path.join(__dirname, '..', 'Sales.xlsx');
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`📊 Found ${rawData.length} properties in Sales.xlsx.`);

    if (rawData.length === 0) {
      console.log('No data to import. Exiting.');
      process.exit(0);
    }

    console.log('\n📋 Preview of the first property to be imported:');
    console.log(JSON.stringify(rawData[0], null, 2));

    console.log('\n💾 Starting import process...');
    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    progressBar.start(rawData.length, 0);

    let imported = 0;
    let errors = 0;

    for (const row of rawData) {
      try {
        await Property.create({
          property_id: row['Property Id'] || '',
          property_name: row['Property Name'] || `Property ${imported + 1}`,
          address: row['Address'] || '',
          city: row['City'] || '',
          state: row['State'] || '',
          tax_id: row['Tax ID'] || '',
          sale_price: parseFloat(row['Sale Price'] || 0),
          sale_date: row['Sale Date'] || new Date().toISOString().split('T')[0],
          building_size: parseFloat(row['GBA'] || 0),
          lot_size: parseFloat(row['Land Area'] || 0),
          cap_rate: parseFloat(row['Cap Rate'] || 0),
          price_per_sf: parseFloat(row['Price Per GBA'] || 0),
          property_type: row['Property Type'] || 'Commercial',
          raw_data: row
        });
        imported++;
      } catch (error) {
        errors++;
      }
      progressBar.increment();
    }

    progressBar.stop();
    console.log('\n\n🎉 IMPORT COMPLETE!');
    console.log(`   - ✅ Successfully imported: ${imported} properties`);
    if (errors > 0) {
      console.log(`   - ❌ Failed to import: ${errors} properties`);
    }

    const totalCount = await Property.count();
    console.log(`\n📊 Total properties in database: ${totalCount}`);
    
    if (totalCount > 0) {
        console.log('\n📋 Verifying sample data from database:');
        const samples = await Property.findAll({ limit: 3 });
        samples.forEach(prop => {
          console.log(`- ${prop.property_name}: Sale Price $${prop.sale_price}, Building Size ${prop.building_size} sq ft`);
          console.log(`  Raw Data Preview: ${JSON.stringify(prop.raw_data).substring(0, 100)}...`);
        });
    }
    
    await sequelize.close();
    process.exit(0);

  } catch (error) {
    console.error('💥 IMPORT FAILED:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

importSalesData();
