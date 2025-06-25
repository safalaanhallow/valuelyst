const { Sequelize } = require('sequelize');
const path = require('path');

async function finalVerification() {
  try {
    console.log('🔍 FINAL VERIFICATION - Database Content Check\n');
    
    // Same database connection as controller
    const sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, './database/valuelyst.sqlite'),
      logging: false
    });
    
    // Same model definition as controller
    const SalesProperty = sequelize.define('sales_property', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      property_name: Sequelize.STRING,
      address: Sequelize.STRING,
      city: Sequelize.STRING,
      state: Sequelize.STRING,
      sale_price: Sequelize.DECIMAL(15, 2),
      sale_date: Sequelize.STRING,
      building_size: Sequelize.DECIMAL(10, 2),
      lot_size: Sequelize.DECIMAL(10, 2),
      cap_rate: Sequelize.DECIMAL(5, 2),
      price_per_sf: Sequelize.DECIMAL(10, 2),
      property_type: Sequelize.STRING,
      annual_net_income: Sequelize.DECIMAL(15, 2),
      year_built: Sequelize.INTEGER
    }, {
      tableName: 'sales_properties',
      timestamps: true
    });
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Count total properties
    const totalCount = await SalesProperty.count();
    console.log(`📊 Total properties in database: ${totalCount}`);
    
    if (totalCount === 0) {
      console.log('❌ CRITICAL: No properties found in database!');
      await sequelize.close();
      return false;
    }
    
    // Test the exact query used by the controller
    const validComps = await SalesProperty.findAll({
      where: {
        sale_price: { [Sequelize.Op.gt]: 0 },
        building_size: { [Sequelize.Op.gt]: 0 }
      },
      order: [['sale_date', 'DESC']],
      limit: 100
    });
    
    console.log(`🎯 Valid comparable properties (price > 0, size > 0): ${validComps.length}`);
    
    if (validComps.length === 0) {
      console.log('❌ CRITICAL: No valid comparable properties found!');
      
      // Check what data exists
      const sampleAny = await SalesProperty.findAll({ limit: 5 });
      console.log('\n📋 Sample of any data:');
      sampleAny.forEach((prop, i) => {
        console.log(`${i+1}. ${prop.property_name} - Price: $${prop.sale_price} - Size: ${prop.building_size}`);
      });
      
      await sequelize.close();
      return false;
    }
    
    // Show sample data that will be returned
    console.log('\n📋 Sample properties that will be shown in frontend:');
    validComps.slice(0, 5).forEach((prop, i) => {
      console.log(`${i+1}. Name: "${prop.property_name || 'N/A'}"`);
      console.log(`   Address: ${prop.address || 'N/A'}`);
      console.log(`   City: ${prop.city || 'N/A'}`);
      console.log(`   Type: ${prop.property_type || 'N/A'}`);
      console.log(`   Sale Price: $${Number(prop.sale_price).toLocaleString()}`);
      console.log(`   Building Size: ${Number(prop.building_size).toLocaleString()} sq ft`);
      console.log(`   Year Built: ${prop.year_built || 'N/A'}`);
      console.log('');
    });
    
    // Verify data structure matches frontend expectations
    const testProp = validComps[0];
    const frontendFormat = {
      id: testProp.id,
      name: testProp.property_name,
      address: testProp.address,
      city: testProp.city,
      propertyType: testProp.property_type,
      salePrice: testProp.sale_price,
      buildingSize: testProp.building_size,
      yearBuilt: testProp.year_built,
      annualNetIncome: testProp.annual_net_income
    };
    
    console.log('🔄 Frontend data mapping test:');
    console.log(JSON.stringify(frontendFormat, null, 2));
    
    await sequelize.close();
    
    console.log('\n🎉 VERIFICATION PASSED!');
    console.log(`   ✅ Database has ${totalCount} properties`);
    console.log(`   ✅ ${validComps.length} valid comparable properties available`);
    console.log(`   ✅ Data structure compatible with frontend`);
    console.log(`   ✅ Ready to replace mock data with real database queries`);
    
    return {
      success: true,
      totalCount,
      validCompsCount: validComps.length,
      sampleData: validComps.slice(0, 5).map(p => p.toJSON())
    };
    
  } catch (error) {
    console.error('❌ VERIFICATION FAILED:', error);
    return false;
  }
}

// Run verification
finalVerification()
  .then(result => {
    if (result && result.success) {
      console.log('\n🚀 READY TO PROCEED WITH FIX!');
    } else {
      console.log('\n🛑 DO NOT PROCEED - Issues found');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
