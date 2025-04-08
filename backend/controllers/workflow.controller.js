const db = require('../models');
const Workflow = db.workflow;
const Property = db.property;
const User = db.user;
const Op = db.Sequelize.Op;

// Create a new workflow
exports.create = async (req, res) => {
  try {
    // Validate request
    if (!req.body.property_id || !req.body.name) {
      return res.status(400).send({
        message: "Property ID and workflow name cannot be empty!"
      });
    }

    // Create a workflow with initial stage requirements
    const workflow = {
      property_id: req.body.property_id,
      name: req.body.name,
      description: req.body.description || '',
      current_stage: 'RFP',
      created_by: req.userId,
      status: 'Active',
      stage_requirements: JSON.stringify({
        RFP: {
          required_fields: ['identification.property_name', 'identification.address', 'physical.property_type'],
          completed: false
        },
        Bid: {
          required_fields: ['income.noi', 'expenses.total_expenses'],
          required_comps: 3, // Require 3 comp selections
          completed: false
        },
        Research: {
          required_fields: ['comps', 'adjustments'],
          completed: false
        },
        Analysis: {
          required_fields: ['valuations.cap_rate', 'valuations.estimated_value'],
          validate_cap_rate: true, // Validate cap rate ±2σ of comps
          completed: false
        },
        Review: {
          required_fields: ['reviewer_id'],
          completed: false
        },
        Delivery: {
          required_fields: [],
          completed: false
        }
      }),
      stage_completion: JSON.stringify({
        RFP: { completed: false, completedAt: null },
        Bid: { completed: false, completedAt: null },
        Research: { completed: false, completedAt: null },
        Analysis: { completed: false, completedAt: null },
        Review: { completed: false, completedAt: null },
        Delivery: { completed: false, completedAt: null }
      }),
      stage_validations: JSON.stringify({
        RFP: { passed: false, validatedAt: null, issues: [] },
        Bid: { passed: false, validatedAt: null, issues: [] },
        Research: { passed: false, validatedAt: null, issues: [] },
        Analysis: { passed: false, validatedAt: null, issues: [] },
        Review: { passed: false, validatedAt: null, issues: [] },
        Delivery: { passed: false, validatedAt: null, issues: [] }
      }),
      stage_notes: JSON.stringify({
        RFP: [],
        Bid: [],
        Research: [],
        Analysis: [],
        Review: [],
        Delivery: []
      })
    };

    // Include optional fields
    if (req.body.assigned_to) workflow.assigned_to = req.body.assigned_to;
    if (req.body.reviewer_id) workflow.reviewer_id = req.body.reviewer_id;
    if (req.body.client_id) workflow.client_id = req.body.client_id;
    if (req.body.due_date) workflow.due_date = req.body.due_date;

    // Save Workflow in the database
    const data = await Workflow.create(workflow);
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while creating the Workflow."
    });
  }
};

// Retrieve all Workflows
exports.findAll = async (req, res) => {
  try {
    const data = await Workflow.findAll();
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving workflows."
    });
  }
};

// Find a single Workflow by id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Workflow.findByPk(id);
    
    if (data) {
      res.send(data);
    } else {
      res.status(404).send({
        message: `Cannot find Workflow with id=${id}.`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Error retrieving Workflow with id=" + req.params.id
    });
  }
};

// Update a Workflow by id
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    req.body.updated_by = req.userId;
    
    const [num] = await Workflow.update(req.body, {
      where: { id: id }
    });
    
    if (num === 1) {
      res.send({
        message: "Workflow was updated successfully."
      });
    } else {
      res.send({
        message: `Cannot update Workflow with id=${id}. Maybe Workflow was not found or req.body is empty!`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Error updating Workflow with id=" + req.params.id
    });
  }
};

// Delete a Workflow by id
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    
    const num = await Workflow.destroy({
      where: { id: id }
    });
    
    if (num === 1) {
      res.send({
        message: "Workflow was deleted successfully!"
      });
    } else {
      res.send({
        message: `Cannot delete Workflow with id=${id}. Maybe Workflow was not found!`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Could not delete Workflow with id=" + req.params.id
    });
  }
};

// Advance workflow to next stage with validation
exports.advanceStage = async (req, res) => {
  try {
    const id = req.params.id;
    const workflow = await Workflow.findByPk(id);
    
    if (!workflow) {
      return res.status(404).send({
        message: `Cannot find Workflow with id=${id}.`
      });
    }
    
    // Get current stage and determine next stage
    const stageOrder = ['RFP', 'Bid', 'Research', 'Analysis', 'Review', 'Delivery'];
    const currentStageIndex = stageOrder.indexOf(workflow.current_stage);
    
    // If already at final stage
    if (currentStageIndex === stageOrder.length - 1) {
      return res.status(400).send({
        message: "Workflow is already at the final stage."
      });
    }
    
    // Validate current stage before advancing
    const validationResult = await validateStage(workflow);
    
    if (!validationResult.passed) {
      return res.status(400).send({
        message: "Cannot advance stage. Validation failed.",
        issues: validationResult.issues
      });
    }
    
    // Update stage completion data
    const stageCompletion = JSON.parse(workflow.stage_completion);
    stageCompletion[workflow.current_stage] = {
      completed: true,
      completedAt: new Date()
    };
    
    // Advance to next stage
    const nextStage = stageOrder[currentStageIndex + 1];
    
    // Update workflow
    const [num] = await Workflow.update({
      current_stage: nextStage,
      stage_completion: JSON.stringify(stageCompletion),
      updated_by: req.userId
    }, {
      where: { id: id }
    });
    
    if (num === 1) {
      res.send({
        message: `Workflow stage advanced from ${workflow.current_stage} to ${nextStage} successfully.`,
        nextStage: nextStage
      });
    } else {
      res.send({
        message: `Cannot update Workflow with id=${id}.`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Error advancing Workflow stage: " + err.message
    });
  }
};

// Add a note to the current stage
exports.addStageNote = async (req, res) => {
  try {
    const id = req.params.id;
    const { note } = req.body;
    
    if (!note) {
      return res.status(400).send({
        message: "Note content cannot be empty!"
      });
    }
    
    const workflow = await Workflow.findByPk(id);
    
    if (!workflow) {
      return res.status(404).send({
        message: `Cannot find Workflow with id=${id}.`
      });
    }
    
    // Add note to current stage
    const stageNotes = JSON.parse(workflow.stage_notes);
    stageNotes[workflow.current_stage].push({
      content: note,
      created_by: req.userId,
      created_at: new Date()
    });
    
    // Update workflow
    const [num] = await Workflow.update({
      stage_notes: JSON.stringify(stageNotes),
      updated_by: req.userId
    }, {
      where: { id: id }
    });
    
    if (num === 1) {
      res.send({
        message: "Note added successfully."
      });
    } else {
      res.send({
        message: `Cannot update Workflow with id=${id}.`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Error adding note: " + err.message
    });
  }
};

// Validate the current stage of a workflow
exports.validateStage = async (req, res) => {
  try {
    const id = req.params.id;
    const workflow = await Workflow.findByPk(id);
    
    if (!workflow) {
      return res.status(404).send({
        message: `Cannot find Workflow with id=${id}.`
      });
    }
    
    const validationResult = await validateStage(workflow);
    
    // Update validation results in the workflow
    const stageValidations = JSON.parse(workflow.stage_validations);
    stageValidations[workflow.current_stage] = {
      passed: validationResult.passed,
      validatedAt: new Date(),
      issues: validationResult.issues
    };
    
    await Workflow.update({
      stage_validations: JSON.stringify(stageValidations),
      updated_by: req.userId
    }, {
      where: { id: id }
    });
    
    res.send(validationResult);
  } catch (err) {
    res.status(500).send({
      message: "Error validating stage: " + err.message
    });
  }
};

// Helper function to validate a workflow stage
async function validateStage(workflow) {
  try {
    const property = await Property.findByPk(workflow.property_id);
    if (!property) {
      return { 
        passed: false, 
        issues: ["Property not found"] 
      };
    }
    
    const requirements = JSON.parse(workflow.stage_requirements);
    const stageReqs = requirements[workflow.current_stage];
    const issues = [];
    
    // Validate required fields
    if (stageReqs.required_fields && stageReqs.required_fields.length > 0) {
      for (const fieldPath of stageReqs.required_fields) {
        const paths = fieldPath.split('.');
        let fieldExists = true;
        let currentObj = property;
        
        // Navigate through property object to find the field
        for (const path of paths) {
          // For JSON fields stored as text
          if (typeof currentObj[path] === 'string' && path.match(/^(identification|zoning|physical|environmental|accessibility|income|expenses|debt|valuations|tenants|comps|adjustments)$/)) {
            try {
              currentObj = JSON.parse(currentObj[path]);
            } catch (e) {
              fieldExists = false;
              break;
            }
          } else if (currentObj[path] === undefined) {
            fieldExists = false;
            break;
          } else {
            currentObj = currentObj[path];
          }
        }
        
        if (!fieldExists || currentObj === null || currentObj === undefined || currentObj === '') {
          issues.push(`Required field '${fieldPath}' is missing or empty`);
        }
      }
    }
    
    // Specific validations for Bid stage
    if (workflow.current_stage === 'Bid' && stageReqs.required_comps) {
      try {
        const comps = JSON.parse(property.comps || '[]');
        if (!Array.isArray(comps) || comps.length < stageReqs.required_comps) {
          issues.push(`At least ${stageReqs.required_comps} comparable properties must be selected for the Bid stage`);
        }
      } catch (e) {
        issues.push('Error parsing comparable properties data');
      }
    }
    
    // Specific validations for Analysis stage
    if (workflow.current_stage === 'Analysis' && stageReqs.validate_cap_rate) {
      try {
        const valuations = JSON.parse(property.valuations || '{}');
        const comps = JSON.parse(property.comps || '[]');
        
        if (valuations.cap_rate && comps.length > 0) {
          // Extract cap rates from comps
          const compCapRates = comps
            .filter(comp => comp.cap_rate)
            .map(comp => parseFloat(comp.cap_rate));
          
          if (compCapRates.length > 0) {
            // Calculate mean and standard deviation
            const mean = compCapRates.reduce((a, b) => a + b, 0) / compCapRates.length;
            const variance = compCapRates.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / compCapRates.length;
            const stdDev = Math.sqrt(variance);
            
            // Check if property cap rate is within ±2σ of comps
            const capRate = parseFloat(valuations.cap_rate);
            const lowerBound = mean - (2 * stdDev);
            const upperBound = mean + (2 * stdDev);
            
            if (capRate < lowerBound || capRate > upperBound) {
              issues.push(`Cap rate (${capRate.toFixed(2)}%) is outside ±2σ range of comparable properties (${lowerBound.toFixed(2)}% to ${upperBound.toFixed(2)}%)`);
            }
          }
        }
      } catch (e) {
        issues.push('Error validating cap rate: ' + e.message);
      }
    }
    
    return {
      passed: issues.length === 0,
      issues: issues
    };
    
  } catch (err) {
    return {
      passed: false,
      issues: ["Error during validation: " + err.message]
    };
  }
}
