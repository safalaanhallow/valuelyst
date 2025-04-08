const { authJwt } = require('../middleware');
const controller = require('../controllers/auth.controller');

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, Content-Type, Accept, Authorization'
    );
    next();
  });

  // These routes are protected by Auth0's express-openid-connect
  // and will handle login/logout automatically
  
  // Handle user profile after Auth0 login
  app.post('/api/auth/profile', [authJwt.verifyToken], controller.handleUserProfile);
  
  // Get user profile
  app.get('/api/auth/profile', [authJwt.verifyToken], controller.getUserProfile);
};
