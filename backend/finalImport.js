const XLSX = require('xlsx');
const { Property, Organization, User } = require('./models');
const { Sequelize } = require('sequelize');
const path = require('path');

async function importSalesData() {
  try {
    console.log('🚀 FINAL IMPORT: Starting Sales.xlsx import...');
    
    // Initialize database connection
    await Property.sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Read Excel file
    const filePath = path.join(__dirname, '..', 'Sales.xlsx');
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`📊 Found ${rawData.length} rows in Excel file`);
    
    // Get or create organization and user
    let [organization] = await Organization.findOrCreate({
      where: { name: 'Default' },
      defaults: { name: 'Default', domain: 'default.com', plan: 'basic' }
    });
    
    let [user] = await User.findOrCreate({
      where: { email: 'admin@default.com' },
      defaults: {
        auth0_id: 'admin123',
        email: 'admin@default.com',
        first_name: 'Admin',
        last_name: 'User',
        organization_id: organization.id,
        role: 'admin'
      }
    });
    
    console.log('💾 Importing properties to database...');
    
    // Delete existing properties to start fresh
    await Property.destroy({ where: { organization_id: organization.id } });
    console.log('🗑️ Cleared existing properties');
    
    let imported = 0;
    
    for (let i = 0; i < Math.min(rawData.length, 100); i++) {
      const row = rawData[i];
      
      try {
        // Map Excel columns to database fields
        const propertyData = {
          organization_id: organization.id,
          created_by: user.id,
          property_name: row['Property Name'] || `Property ${i + 1}`,
          address: row['Property Address'] || row['Address'] || '',
          city: row['City'] || '',
          state: row['State/Province'] || row['State'] || '',
          zipcode: row['Postal Code'] || row['Zip Code'] || '',
          sale_price: parseFloat(row['Sale Price'] || row['Price'] || 0),
          sale_date: row['Sale Date'] || new Date().toISOString().split('T')[0],
          building_size: parseFloat(row['GBA'] || row['Building Size'] || row['Building Area'] || 0),
          lot_size: parseFloat(row['Land Area'] || row['Lot Size'] || 0),
          cap_rate: parseFloat(row['Cap Rate'] || 0),
          price_per_sf: parseFloat(row['Price Per GBA'] || row['Price Per SF'] || 0),
          property_type: row['Property Type'] || row['Property Major Type'] || 'Commercial',
          latitude: '',
          longitude: '',
          status: 'active'
        };
        
        await Property.create(propertyData);
        imported++;
        
        if (imported % 10 === 0) {
          console.log(`✅ Imported ${imported} properties...`);
        }
        
      } catch (error) {
        console.log(`❌ Error importing row ${i + 1}:`, error.message);
      }
    }
    
    console.log(`🎉 IMPORT COMPLETE! Successfully imported ${imported} properties`);
    
    // Verify the import
    const totalCount = await Property.count({ where: { organization_id: organization.id } });
    console.log(`📊 Total properties in database: ${totalCount}`);
    
    // Show sample data
    const sampleProperties = await Property.findAll({
      where: { organization_id: organization.id },
      limit: 3,
      attributes: ['id', 'property_name', 'sale_price', 'building_size']
    });
    
    console.log('\n📋 Sample imported properties:');
    sampleProperties.forEach(prop => {
      console.log(`- ${prop.property_name}: $${prop.sale_price} (${prop.building_size} sq ft)`);
    });
    
    process.exit(0);
    
  } catch (error) {
    console.error('💥 IMPORT FAILED:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

importSalesData();
