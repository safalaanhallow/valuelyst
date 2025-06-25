const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Standard Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database
const db = require('./models');

// Import property controller directly
const propertyController = require('./controllers/property.controller');

// Define routes directly
app.get('/api/properties/comps/available', propertyController.getAvailableComps);
app.post('/api/properties/appraisal/generate', propertyController.generateAppraisal);

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

// Database sync and server start
db.sequelize.sync()
  .then(() => {
    console.log('Database synchronized successfully.');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Simple server is running on port ${PORT}`);
      console.log('Auth0 disabled for testing - API endpoints available');
    });
  })
  .catch((err) => {
    console.error('Failed to sync database:', err);
  });
