module.exports = app => {
  const workflows = require("../controllers/workflow.controller.js");
  const { authJwt } = require("../middleware");
  const router = require("express").Router();

  // Apply middleware to verify JWT token
  router.use(authJwt.verifyToken);

  // Create a new Workflow
  router.post("/", workflows.create);

  // Retrieve all Workflows
  router.get("/", workflows.findAll);

  // Retrieve a single Workflow by id
  router.get("/:id", workflows.findOne);

  // Update a Workflow by id
  router.put("/:id", workflows.update);

  // Delete a Workflow by id
  router.delete("/:id", workflows.delete);

  // Advance a Workflow to the next stage with validation
  router.post("/:id/advance", workflows.advanceStage);

  // Add a note to the current stage of a Workflow
  router.post("/:id/notes", workflows.addStageNote);

  // Validate the current stage of a Workflow
  router.get("/:id/validate", workflows.validateStage);

  app.use("/api/workflows", router);
};
