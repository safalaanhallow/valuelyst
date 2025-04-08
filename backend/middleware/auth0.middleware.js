const { auth } = require('express-openid-connect');
const { expressjwt: jwt } = require('express-jwt');
const jwks = require('jwks-rsa');
const jwtAuthz = require('express-jwt-authz');

// Configure Auth0 authentication middleware
const configureAuth0 = () => {
  return auth({
    authRequired: false,
    auth0Logout: true,
    baseURL: process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`,
    clientID: process.env.AUTH0_CLIENT_ID,
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
    secret: process.env.AUTH0_CLIENT_SECRET
  });
};

// Validate JWT tokens from Auth0
const checkJwt = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256']
});

// Check if user has required permissions/scopes
const checkPermissions = (permissions) => {
  return jwtAuthz(permissions, { customScopeKey: 'permissions' });
};

// Check if request has MFA
const checkMFA = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  // Get the token
  const token = authHeader.split(' ')[1];
  
  // Decode JWT token
  try {
    // This doesn't verify the token - that's done by checkJwt
    // This just decodes to check for amr claim
    const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    
    // Check if 'amr' claim includes MFA ('mfa')
    if (!decoded.amr || !decoded.amr.includes('mfa')) {
      return res.status(403).json({
        message: 'Multi-factor authentication required for this operation'
      });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Check if user has required role
const checkRole = (roles) => {
  return (req, res, next) => {
    const userRoles = req.auth['https://valuelyst.com/roles'] || [];
    const hasRole = Array.isArray(roles) 
      ? roles.some(role => userRoles.includes(role))
      : userRoles.includes(roles);
      
    if (!hasRole) {
      return res.status(403).json({
        message: 'Insufficient role permissions'
      });
    }
    
    next();
  };
};

// Middleware for requiring MFA on write operations
const requireMFAForWrites = (req, res, next) => {
  // Only check MFA for write operations (POST, PUT, DELETE, PATCH)
  const writeOperations = ['POST', 'PUT', 'DELETE', 'PATCH'];
  
  if (writeOperations.includes(req.method)) {
    return checkMFA(req, res, next);
  }
  
  next();
};

module.exports = {
  configureAuth0,
  checkJwt,
  checkPermissions,
  checkMFA,
  checkRole,
  requireMFAForWrites
};
