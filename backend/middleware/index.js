const auth0Middleware = require('./auth0.middleware');
const propertyValidation = require('./propertyValidation');

module.exports = {
  auth0: auth0Middleware,
  verifySignUp: require('./verifySignUp'), // This will be implemented later if needed
  authJwt: require('./authJwt'),  // This will be implemented later if needed
  propertyValidation: propertyValidation,
};
