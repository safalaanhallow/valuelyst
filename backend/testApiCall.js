const http = require('http');

async function testAppraisalAPI() {
  try {
    console.log('🧪 Testing Appraisal API endpoint...');
    
    const postData = JSON.stringify({
      propertyId: 1,  
      selectedCompIds: [5, 65, 69],  
      adjustments: {},
      subjectPropertyData: {}
    });

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/properties/appraisal',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ API Response Status:', res.statusCode);
          
          if (response.success && response.appraisal) {
            const appraisal = response.appraisal;
            console.log('🎉 APPRAISAL SUCCESS!');
            console.log('📊 Final Appraised Value:', `$${appraisal.valuationSummary.finalValue.toLocaleString()}`);
            console.log('🎯 Confidence Level:', `${appraisal.valuationSummary.confidence}%`);
            console.log('📈 Value Range:', `$${appraisal.valuationSummary.valueRange.low.toLocaleString()} - $${appraisal.valuationSummary.valueRange.high.toLocaleString()}`);
            console.log('🏢 Subject Property:', appraisal.subjectProperty.propertyType);
            console.log('📋 Comparables Used:', appraisal.comparables.length);
            console.log('📄 Professional Report Generated:', appraisal.professionalReport ? 'YES' : 'NO');
            console.log('📅 Analysis Date:', new Date(appraisal.analysisDate).toLocaleString());
          } else {
            console.log('📋 Full Response:', response);
          }
          
          if (res.statusCode >= 400) {
            console.error('❌ Server Error:', response.message || response.error || 'Unknown error');
          }
        } catch (parseError) {
          console.error('❌ Failed to parse response:', parseError.message);
          console.log('Raw response:', data);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ API Test Failed:', error.message);
    });

    req.write(postData);
    req.end();
    
  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
  }
}

testAppraisalAPI();
