const db = require('./models');
const { SalesProperty } = db;

async function verifyDatabase() {
  try {
    console.log('🔍 Verifying database content...\n');
    
    // Check if sales_properties table exists and has data
    const count = await SalesProperty.count();
    console.log(`📊 Total properties in database: ${count}`);
    
    if (count === 0) {
      console.log('❌ NO DATA FOUND - Database is empty!');
      return false;
    }
    
    // Get sample records to check structure
    const sampleRecords = await SalesProperty.findAll({
      limit: 5,
      order: [['id', 'ASC']]
    });
    
    console.log('\n📋 Sample records:');
    sampleRecords.forEach((record, index) => {
      console.log(`\n${index + 1}. Record ID: ${record.id}`);
      console.log(`   Property Name: ${record.property_name || 'N/A'}`);
      console.log(`   Address: ${record.address || 'N/A'}`);
      console.log(`   City: ${record.city || 'N/A'}`);
      console.log(`   Property Type: ${record.property_type || 'N/A'}`);
      console.log(`   Sale Price: $${record.sale_price || 0}`);
      console.log(`   Building Size: ${record.building_size || 0} sq ft`);
      console.log(`   Year Built: ${record.year_built || 'N/A'}`);
      console.log(`   Annual Net Income: $${record.annual_net_income || 0}`);
    });
    
    // Check for properties with valid data for comps
    const validComps = await SalesProperty.findAll({
      where: {
        sale_price: { [db.Sequelize.Op.gt]: 0 },
        building_size: { [db.Sequelize.Op.gt]: 0 }
      },
      limit: 10
    });
    
    console.log(`\n✅ Valid comparable properties (price > 0, size > 0): ${validComps.length}`);
    
    return {
      totalCount: count,
      hasValidData: count > 0,
      validCompsCount: validComps.length,
      sampleData: sampleRecords.map(r => r.toJSON())
    };
    
  } catch (error) {
    console.error('❌ Database verification failed:', error);
    return false;
  }
}

// Run verification
verifyDatabase()
  .then(result => {
    if (result) {
      console.log('\n🎉 DATABASE VERIFICATION COMPLETE');
      console.log(`   Total Records: ${result.totalCount}`);
      console.log(`   Valid Comps: ${result.validCompsCount}`);
    } else {
      console.log('\n💥 DATABASE VERIFICATION FAILED');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Verification error:', error);
    process.exit(1);
  });
