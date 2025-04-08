module.exports = (sequelize, Sequelize) => {
  const Workflow = sequelize.define('workflow', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    property_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'properties',
        key: 'id'
      }
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      comment: 'Name of the valuation project'
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Description of the valuation project'
    },
    current_stage: {
      type: Sequelize.ENUM('RFP', 'Bid', 'Research', 'Analysis', 'Review', 'Delivery'),
      allowNull: false,
      defaultValue: 'RFP',
      comment: 'Current stage in the LightBox-compatible workflow'
    },
    stage_requirements: {
      type: Sequelize.TEXT,
      allowNull: true,
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              JSON.parse(value);
            } catch (e) {
              throw new Error('Stage requirements must be valid JSON');
            }
          }
        }
      },
      comment: 'JSON containing specific requirements for each stage'
    },
    stage_validations: {
      type: Sequelize.TEXT,
      allowNull: true,
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              JSON.parse(value);
            } catch (e) {
              throw new Error('Stage validations must be valid JSON');
            }
          }
        }
      },
      comment: 'JSON containing validation results for each stage'
    },
    stage_completion: {
      type: Sequelize.TEXT,
      allowNull: true,
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              JSON.parse(value);
            } catch (e) {
              throw new Error('Stage completion must be valid JSON');
            }
          }
        }
      },
      comment: 'JSON containing completion status and dates for each stage'
    },
    stage_notes: {
      type: Sequelize.TEXT,
      allowNull: true,
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              JSON.parse(value);
            } catch (e) {
              throw new Error('Stage notes must be valid JSON');
            }
          }
        }
      },
      comment: 'JSON containing notes for each stage'
    },
    assigned_to: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'User ID of the appraiser assigned to this workflow'
    },
    reviewer_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'User ID of the reviewer assigned to this workflow'
    },
    client_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'User ID of the client for this workflow'
    },
    due_date: {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Due date for the entire workflow'
    },
    status: {
      type: Sequelize.ENUM('Active', 'On Hold', 'Completed', 'Cancelled'),
      allowNull: false,
      defaultValue: 'Active',
      comment: 'Overall status of the workflow'
    },
    created_by: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    updated_by: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    updatedAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    }
  });

  return Workflow;
};
