const axios = require('axios');

async function countProperties() {
  try {
    console.log('🔢 Counting properties from API...\n');
    
    const response = await axios.get('http://localhost:3001/api/properties/comps/available');
    const data = response.data;
    
    console.log(`📊 API Response:`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Message: ${data.message}`);
    console.log(`   Properties Count: ${data.comps ? data.comps.length : 0}`);
    
    if (data.comps && data.comps.length > 0) {
      console.log('\n📋 First 5 properties:');
      data.comps.slice(0, 5).forEach((prop, i) => {
        console.log(`   ${i+1}. "${prop.property_name}" in ${prop.city}`);
      });
      
      console.log(`\n✅ SUCCESS: Now showing ${data.comps.length} properties instead of 2!`);
      
      if (data.comps.length > 50) {
        console.log('🎉 ISSUE RESOLVED: Frontend will now show many properties!');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

countProperties();
