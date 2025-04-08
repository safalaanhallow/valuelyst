const { authJwt } = require('../middleware');
const controller = require('../controllers/item.controller');

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, Content-Type, Accept, Authorization'
    );
    next();
  });

  // Get all items - role-based filtering happens in controller
  app.get('/api/items', [
    authJwt.verifyToken
  ], controller.getAllItems);
  
  // Get item by ID - role-based access control in controller
  app.get('/api/items/:id', [
    authJwt.verifyToken
  ], controller.getItemById);
  
  // Create item - requires MFA as it's a write operation
  app.post('/api/items', [
    authJwt.verifyToken,
    authJwt.requireMFA
  ], controller.createItem);
  
  // Update item - requires MFA as it's a write operation
  // Different roles have different update permissions (handled in controller)
  app.put('/api/items/:id', [
    authJwt.verifyToken,
    authJwt.requireMFA
  ], controller.updateItem);
  
  // Delete item - requires MFA as it's a write operation
  // Only Admin or item owner can delete (handled in controller)
  app.delete('/api/items/:id', [
    authJwt.verifyToken,
    authJwt.requireMFA
  ], controller.deleteItem);
  
  // Get items for a specific user - role-based access control in controller
  app.get('/api/users/:userId/items', [
    authJwt.verifyToken
  ], controller.getUserItems);
};
