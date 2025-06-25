const express = require('express');

// Create a mock request and response to test the controller
async function testController() {
  try {
    console.log('🧪 Testing property controller getAvailableComps...\n');
    
    // Import the controller
    const { getAvailableComps } = require('./controllers/property.controller');
    
    // Create mock request and response objects
    const mockReq = {};
    const mockRes = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.jsonData = data;
        console.log(`📊 Controller Response (Status: ${this.statusCode}):`);
        console.log(`   Message: ${data.message || 'N/A'}`);
        console.log(`   Properties Count: ${data.comps ? data.comps.length : 0}`);
        
        if (data.comps && data.comps.length > 0) {
          console.log('\n📋 Sample properties from controller:');
          data.comps.slice(0, 3).forEach((prop, i) => {
            console.log(`   ${i+1}. ${prop.property_name || 'N/A'} (${prop.city || 'N/A'})`);
          });
        }
        
        return this;
      }
    };
    
    // Call the controller function
    await getAvailableComps(mockReq, mockRes);
    
    // Check results
    if (mockRes.statusCode === 200 && mockRes.jsonData.comps && mockRes.jsonData.comps.length > 2) {
      console.log('\n✅ CONTROLLER TEST PASSED!');
      console.log(`   ✅ Returns ${mockRes.jsonData.comps.length} properties`);
      console.log(`   ✅ Much more than the 2 mock properties`);
      console.log(`   ✅ Ready to replace mock data in test-server`);
      return true;
    } else {
      console.log('\n❌ CONTROLLER TEST FAILED!');
      console.log(`   Status: ${mockRes.statusCode}`);
      console.log(`   Properties: ${mockRes.jsonData.comps ? mockRes.jsonData.comps.length : 0}`);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Controller test error:', error);
    return false;
  }
}

testController()
  .then(success => {
    if (success) {
      console.log('\n🚀 READY TO IMPLEMENT FIX!');
    } else {
      console.log('\n🛑 CANNOT PROCEED - Controller issues');
    }
    process.exit(0);
  });
