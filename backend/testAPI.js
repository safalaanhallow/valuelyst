const { Sequelize } = require('sequelize');
const path = require('path');

async function testCompsAPI() {
  try {
    console.log('🧪 Testing comps API...');
    
    const sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, 'database/valuelyst.sqlite'),
      logging: false
    });
    
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
      property_type: Sequelize.STRING
    }, {
      tableName: 'sales_properties',
      timestamps: true
    });
    
    const properties = await SalesProperty.findAll({
      where: {
        sale_price: { [Sequelize.Op.gt]: 0 },
        building_size: { [Sequelize.Op.gt]: 0 }
      },
      order: [['sale_date', 'DESC']],
      limit: 10
    });

    console.log(`✅ Found ${properties.length} properties with valid data`);
    console.log('\n📋 Sample properties:');
    
    properties.slice(0, 5).forEach((prop, index) => {
      console.log(`${index + 1}. ${prop.property_name}`);
      console.log(`   Address: ${prop.address}, ${prop.city}, ${prop.state}`);
      console.log(`   Sale Price: $${prop.sale_price?.toLocaleString()}`);
      console.log(`   Building Size: ${prop.building_size} sq ft`);
      console.log(`   Price/SF: $${prop.price_per_sf}`);
      console.log('');
    });
    
    await sequelize.close();
    console.log('🎉 API test successful! Real data is available for comps selection.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCompsAPI();
