const { Sequelize } = require('sequelize');
const path = require('path');

async function checkAvailableFields() {
  try {
    console.log('🔍 Checking all available fields in Sales data...\n');
    
    const sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, './database/valuelyst.sqlite'),
      logging: false
    });
    
    // Get table structure
    const [results] = await sequelize.query("PRAGMA table_info(sales_properties);");
    
    console.log('📋 Available columns in sales_properties table:');
    results.forEach((col, i) => {
      console.log(`   ${i+1}. ${col.name} (${col.type})`);
    });
    
    // Get sample data to see what's populated
    const [sampleData] = await sequelize.query("SELECT * FROM sales_properties LIMIT 3;");
    
    console.log('\n📊 Sample data to see field content:');
    sampleData.forEach((row, i) => {
      console.log(`\n   Record ${i+1}:`);
      Object.keys(row).forEach(key => {
        const value = row[key];
        if (value !== null && value !== '') {
          console.log(`     ${key}: ${value}`);
        } else {
          console.log(`     ${key}: [EMPTY]`);
        }
      });
    });
    
    await sequelize.close();
    
  } catch (error) {
    console.error('❌ Error checking fields:', error);
  }
}

checkAvailableFields();
