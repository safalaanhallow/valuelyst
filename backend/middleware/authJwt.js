// This middleware will serve as a bridge between our Auth0 integration and the existing code
const auth0 = require('./auth0.middleware');

const verifyToken = auth0.checkJwt;

// Role-based middleware functions
const isAdmin = auth0.checkRole('Admin');
const isAppraiser = auth0.checkRole(['Admin', 'Appraiser']);
const isReviewer = auth0.checkRole(['Admin', 'Reviewer']);
const isClient = auth0.checkRole(['Admin', 'Appraiser', 'Reviewer', 'Client']);

// MFA check for all write operations
const requireMFA = auth0.requireMFAForWrites;

module.exports = {
  verifyToken,
  isAdmin,
  isAppraiser,
  isReviewer,
  isClient,
  requireMFA
};
