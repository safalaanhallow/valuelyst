const { authJwt, propertyValidation } = require("../middleware");
const controller = require("../controllers/import.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Upload CSV file
  app.post(
    "/api/import/comps/upload",
    [authJwt.verifyToken],
    controller.uploadCompsCSV
  );

  // Process CSV file
  app.post(
    "/api/import/comps/process",
    [authJwt.verifyToken, propertyValidation.validateCompsData],
    controller.processCompsCSV
  );

  // Preview CSV columns
  app.get(
    "/api/import/preview/:filename",
    [authJwt.verifyToken],
    controller.previewCSVColumns
  );

  // Get default mappings
  app.get(
    "/api/import/mappings/default",
    [authJwt.verifyToken],
    controller.getDefaultMappings
  );

  // Get available target fields
  app.get(
    "/api/import/fields",
    [authJwt.verifyToken],
    controller.getAvailableTargetFields
  );
};
