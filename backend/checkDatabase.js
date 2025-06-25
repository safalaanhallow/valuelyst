const { Sequelize } = require('sequelize');
const path = require('path');

async function checkDatabase() {
  try {
    console.log('🔍 Checking database contents...');
    
    const sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, 'database/valuelyst.sqlite'),
      logging: false
    });
    
    const SalesProperty = sequelize.define('sales_property', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
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
      property_type: Sequelize.STRING
    }, {
      tableName: 'sales_properties',
      timestamps: true
    });
    
    // Total count
    const totalCount = await SalesProperty.count();
    console.log(`📊 Total properties in database: ${totalCount}`);
    
    // Properties with valid sale prices
    const withPrices = await SalesProperty.count({
      where: { sale_price: { [Sequelize.Op.gt]: 0 } }
    });
    console.log(`💰 Properties with sale price > 0: ${withPrices}`);
    
    // Properties with valid building sizes
    const withSizes = await SalesProperty.count({
      where: { building_size: { [Sequelize.Op.gt]: 0 } }
    });
    console.log(`🏢 Properties with building size > 0: ${withSizes}`);
    
    // Properties with both
    const withBoth = await SalesProperty.count({
      where: { 
        sale_price: { [Sequelize.Op.gt]: 0 },
        building_size: { [Sequelize.Op.gt]: 0 }
      }
    });
    console.log(`✅ Properties with both price and size > 0: ${withBoth}`);
    
    // Sample of first 5 records
    console.log('\n📋 Sample of first 5 properties:');
    const sample = await SalesProperty.findAll({
      limit: 5,
      order: [['id', 'ASC']]
    });
    
    sample.forEach((prop, index) => {
      console.log(`${index + 1}. ${prop.property_name || 'No Name'}`);
      console.log(`   Price: $${prop.sale_price || 0} | Size: ${prop.building_size || 0} sq ft`);
      console.log(`   Address: ${prop.address || 'No Address'}`);
      console.log(`   Type: ${prop.property_type || 'Unknown'}`);
      console.log('');
    });
    
    // Sample of properties with valid data
    console.log('📋 Sample of properties with valid sale prices:');
    const validSample = await SalesProperty.findAll({
      where: { sale_price: { [Sequelize.Op.gt]: 0 } },
      limit: 5,
      order: [['sale_price', 'DESC']]
    });
    
    if (validSample.length > 0) {
      validSample.forEach((prop, index) => {
        console.log(`${index + 1}. ${prop.property_name || 'No Name'}`);
        console.log(`   Price: $${prop.sale_price?.toLocaleString()} | Size: ${prop.building_size || 0} sq ft | PSF: $${prop.price_per_sf || 0}`);
        console.log(`   Date: ${prop.sale_date || 'Unknown'}`);
      });
    } else {
      console.log('❌ No properties found with valid sale prices');
    }
    
    await sequelize.close();
    
  } catch (error) {
    console.error('💥 Database check failed:', error.message);
  }
}

checkDatabase();
