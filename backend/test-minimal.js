const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Basic middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Minimal server is running!' });
});

// Hardcoded test data for comparable properties
app.get('/api/properties/comps/available', (req, res) => {
  const testComps = [
    {
      id: 1,
      property_id: 'TEST001',
      property_name: 'Test Property 1',
      address: '123 Test St',
      city: 'Test City',
      state: 'TS',
      property_type: 'Commercial',
      sale_price: 0,
      building_size: 10000,
      raw_data: {
        Price: 1500000,
        'Building Size': 10000,
        'Property Type': 'Office',
        Address: '123 Test St',
        City: 'Test City'
      }
    },
    {
      id: 2,
      property_id: 'TEST002', 
      property_name: 'Test Property 2',
      address: '456 Test Ave',
      city: 'Test City',
      state: 'TS',
      property_type: 'Commercial',
      sale_price: 0,
      building_size: 8000,
      raw_data: {
        Price: 1200000,
        'Building Size': 8000,
        'Property Type': 'Retail',
        Address: '456 Test Ave',
        City: 'Test City'
      }
    }
  ];
  
  res.json({ comps: testComps });
});

// Simple appraisal endpoint
app.post('/api/properties/appraisal/generate', (req, res) => {
  res.json({
    success: true,
    message: 'Test appraisal generated',
    appraisal: {
      valuationSummary: {
        finalValue: 1350000,
        valueRange: { min: 1200000, max: 1500000 }
      }
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Minimal test server running on port ${PORT}`);
});
