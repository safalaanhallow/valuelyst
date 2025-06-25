const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Standard Middleware
app.use(cors());
app.use(express.json());

// Import real property controller
const { getAvailableComps, generateAppraisal } = require('./controllers/property.controller');

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test server is running!' });
});

// Real comps endpoint using controller (replaces mock data)
app.get('/api/properties/comps/available', getAvailableComps);

// Appraisal endpoint using controller
app.post('/api/properties/appraisal', generateAppraisal);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Real Sales.xlsx data available - thousands of properties!');
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  process.exit(0);
});
