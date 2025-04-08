const { authJwt, propertyValidation } = require('../middleware');
const controller = require('../controllers/property.controller');

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, Content-Type, Accept, Authorization'
    );
    next();
  });

  // Get all properties - role-based filtering happens in controller
  app.get('/api/properties', [
    authJwt.verifyToken
  ], controller.getAllProperties);
  
  // Get property by ID - role-based access control in controller
  app.get('/api/properties/:id', [
    authJwt.verifyToken
  ], controller.getPropertyById);
  
  // Create property - requires MFA as it's a write operation
  // Only Admin and Appraiser can create properties (enforced in controller)
  app.post('/api/properties', [
    authJwt.verifyToken,
    authJwt.requireMFA,
    propertyValidation.validateCriticalFields
  ], controller.createProperty);
  
  // Update property - requires MFA as it's a write operation
  // Different roles have different update permissions (handled in controller)
  app.put('/api/properties/:id', [
    authJwt.verifyToken,
    authJwt.requireMFA,
    propertyValidation.validateCriticalFields
  ], controller.updateProperty);
  
  // Delete property - requires MFA as it's a write operation
  // Only Admin can delete properties (handled in controller)
  app.delete('/api/properties/:id', [
    authJwt.verifyToken,
    authJwt.isAdmin,
    authJwt.requireMFA
  ], controller.deleteProperty);
  
  // Get properties for a specific organization - role-based access control in controller
  app.get('/api/organizations/:orgId/properties', [
    authJwt.verifyToken
  ], controller.getOrganizationProperties);
};
