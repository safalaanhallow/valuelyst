const XLSX = require('xlsx');
const { Property, Organization, User } = require('./models');
const path = require('path');

async function importSalesData() {
  try {
    console.log('🚀 Starting Sales.xlsx import...');
    
    // Read the Excel file
    const filePath = path.join(__dirname, '..', 'Sales.xlsx');
    console.log('📁 Reading file from:', filePath);
    
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`📊 Found ${data.length} rows in Excel file`);
    
    // Get or create organization
    let organization = await Organization.findOne({ where: { name: 'Default' } });
    if (!organization) {
      organization = await Organization.create({
        name: 'Default',
        domain: 'default.com',
        plan: 'basic'
      });
      console.log('✅ Created organization');
    }
    
    // Get or create user
    let user = await User.findOne({ where: { email: 'admin@default.com' } });
    if (!user) {
      user = await User.create({
        auth0_id: 'admin123',
        email: 'admin@default.com',
        first_name: 'Admin',
        last_name: 'User',
        organization_id: organization.id,
        role: 'admin'
      });
      console.log('✅ Created user');
    }
    
    console.log('💾 Importing properties...');
    let imported = 0;
    
    for (let i = 0; i < Math.min(data.length, 100); i++) {
      const row = data[i];
      
      try {
        const property = await Property.create({
          organization_id: organization.id,
          created_by: user.id,
          property_name: row['Property Name'] || `Property ${i + 1}`,
          address: row['Address'] || '',
          city: row['City'] || '',
          state: row['State'] || '',
          zipcode: row['Zip Code'] || '',
          sale_price: parseFloat(row['Sale Price']) || 0,
          sale_date: row['Sale Date'] || new Date(),
          building_size: parseFloat(row['Building Size']) || 0,
          lot_size: parseFloat(row['Lot Size']) || 0,
          cap_rate: parseFloat(row['Cap Rate']) || 0,
          price_per_sf: parseFloat(row['Price Per SF']) || 0,
          latitude: '',
          longitude: '',
          property_type: row['Property Type'] || 'Commercial',
          status: 'active'
        });
        
        imported++;
        if (imported % 10 === 0) {
          console.log(`✅ Imported ${imported} properties...`);
        }
      } catch (error) {
        console.log(`❌ Error importing row ${i + 1}:`, error.message);
      }
    }
    
    console.log(`🎉 Import complete! Successfully imported ${imported} properties`);
    
    // Verify the data
    const count = await Property.count({ where: { organization_id: organization.id } });
    console.log(`📊 Total properties in database: ${count}`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('💥 Import failed:', error);
    process.exit(1);
  }
}

importSalesData();
