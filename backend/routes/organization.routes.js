const { authJwt } = require('../middleware');
const controller = require('../controllers/organization.controller');

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, Content-Type, Accept, Authorization'
    );
    next();
  });

  // Get all organizations - Admin can see all, others only see their own
  app.get('/api/organizations', [
    authJwt.verifyToken
  ], controller.getAllOrganizations);
  
  // Get organization by ID - role-based access control in controller
  app.get('/api/organizations/:id', [
    authJwt.verifyToken
  ], controller.getOrganizationById);
  
  // Create organization - Admin only, requires MFA as it's a write operation
  app.post('/api/organizations', [
    authJwt.verifyToken,
    authJwt.isAdmin,
    authJwt.requireMFA
  ], controller.createOrganization);
  
  // Update organization - Admin can update all, Appraisers can update limited fields of their own org
  // Requires MFA as it's a write operation
  app.put('/api/organizations/:id', [
    authJwt.verifyToken,
    authJwt.requireMFA
  ], controller.updateOrganization);
  
  // Delete organization - Admin only, requires MFA as it's a write operation
  app.delete('/api/organizations/:id', [
    authJwt.verifyToken,
    authJwt.isAdmin,
    authJwt.requireMFA
  ], controller.deleteOrganization);
  
  // Get all users for an organization - Admin or organization Appraiser/Reviewer only
  app.get('/api/organizations/:id/users', [
    authJwt.verifyToken
  ], controller.getOrganizationUsers);
  
  // Update user role within organization - Admin or organization Appraiser only, requires MFA
  app.put('/api/organizations/:orgId/users/:userId/role', [
    authJwt.verifyToken,
    authJwt.requireMFA
  ], controller.updateUserRole);
  
  // Add user to organization - Admin or organization Appraiser only, requires MFA
  app.post('/api/organizations/:orgId/users', [
    authJwt.verifyToken,
    authJwt.requireMFA
  ], controller.addUserToOrganization);
  
  // Remove user from organization - Admin or organization Appraiser only, requires MFA
  app.delete('/api/organizations/:orgId/users/:userId', [
    authJwt.verifyToken,
    authJwt.requireMFA
  ], controller.removeUserFromOrganization);
  
  // Update organization's data export settings - Admin or organization Appraiser only, requires MFA
  app.put('/api/organizations/:orgId/export-settings', [
    authJwt.verifyToken,
    authJwt.requireMFA
  ], controller.updateExportSettings);
  
  // Get organization's data export settings - Members of the organization can view
  app.get('/api/organizations/:orgId/export-settings', [
    authJwt.verifyToken
  ], controller.getExportSettings);
};
