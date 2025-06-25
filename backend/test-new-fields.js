const axios = require('axios');

async function testNewFields() {
  try {
    console.log('🔍 Testing enhanced property fields...\n');
    
    const response = await axios.get('http://localhost:3001/api/properties/comps/available');
    const properties = response.data.comps;
    
    console.log(`📊 Found ${properties.length} properties\n`);
    
    // Show first 5 properties with new fields
    properties.slice(0, 5).forEach((prop, i) => {
      console.log(`${i + 1}. Property:`);
      console.log(`   Name: ${prop.property_name || 'N/A'}`);
      console.log(`   Property ID: ${prop.property_id || 'N/A'}`);
      console.log(`   Tax ID: ${prop.tax_id || 'N/A'}`);
      console.log(`   Address: ${prop.address || 'N/A'}`);
      console.log(`   City: ${prop.city || 'N/A'}`);
      console.log(`   Sale Price: $${(prop.sale_price || 0).toLocaleString()}`);
      console.log('');
    });
    
    // Count properties with IDs
    const withPropertyId = properties.filter(p => p.property_id).length;
    const withTaxId = properties.filter(p => p.tax_id).length;
    
    console.log(`✅ Properties with Property ID: ${withPropertyId}/${properties.length}`);
    console.log(`✅ Properties with Tax ID: ${withTaxId}/${properties.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testNewFields();
