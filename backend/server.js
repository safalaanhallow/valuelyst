const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Import Auth0 middleware
const { auth0, authJwt } = require('./middleware');

// Configure Auth0
app.use(auth0.configureAuth0());

// Standard Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enforce MFA for all write operations
app.use(authJwt.requireMFA);

// Database
const db = require('./models');
db.sequelize.sync()
  .then(() => {
    console.log('Database synchronized successfully.');
  })
  .catch((err) => {
    console.error('Failed to sync database:', err);
  });

// Public Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to ValueLyst API' });
});
app.get('/api/public', (req, res) => {
  res.json({ message: 'This is a public endpoint' });
});

// Auth Routes - these will be updated to work with Auth0
require('./routes/auth.routes')(app);

// Protected Routes - all of these require authentication
app.use('/api/users', authJwt.verifyToken);
app.use('/api/items', authJwt.verifyToken);
app.use('/api/properties', authJwt.verifyToken);
app.use('/api/organizations', authJwt.verifyToken);
app.use('/api/workflows', authJwt.verifyToken);

// Apply routes
require('./routes/user.routes')(app);
require('./routes/item.routes')(app);
require('./routes/property.routes')(app);
require('./routes/organization.routes')(app);
require('./routes/workflow.routes')(app);
require('./routes/import.routes')(app);

// Error handler for Auth0
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ message: 'Invalid token' });
  }
  
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Auth0 integration active with MFA enforcement for write operations`);
});
