const { authJwt } = require('../middleware');
const controller = require('../controllers/user.controller');

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, Content-Type, Accept, Authorization'
    );
    next();
  });

  // Only Admin and Appraiser can see all users
  app.get('/api/users', [
    authJwt.verifyToken, 
    authJwt.isAppraiser // This includes Admin due to how we defined isAppraiser
  ], controller.getAllUsers);
  
  // Any authenticated user can get a specific user by ID
  // Business logic in the controller determines what data they can access
  app.get('/api/users/:id', [
    authJwt.verifyToken
  ], controller.getUserById);
  
  // Update user - requires MFA due to being a write operation
  // Controller enforces that users can only update their own data unless they're Admin
  app.put('/api/users/:id', [
    authJwt.verifyToken, 
    authJwt.requireMFA
  ], controller.updateUser);
  
  // Only Admin can delete users - requires MFA due to being a write operation
  app.delete('/api/users/:id', [
    authJwt.verifyToken, 
    authJwt.isAdmin, 
    authJwt.requireMFA
  ], controller.deleteUser);
};
