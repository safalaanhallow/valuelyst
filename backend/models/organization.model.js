module.exports = (sequelize, Sequelize) => {
  const Organization = sequelize.define('organization', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT
    },
    type: {
      type: Sequelize.STRING,
      validate: {
        isIn: [['Appraisal Firm', 'Brokerage', 'Financial Institution', 'Real Estate Developer', 'Property Management', 'Government', 'Other']]
      }
    },
    address: {
      type: Sequelize.TEXT,
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              JSON.parse(value);
            } catch (e) {
              throw new Error('Address must be valid JSON');
            }
          }
        }
      },
      comment: 'JSON containing address details'
    },
    contact_info: {
      type: Sequelize.TEXT,
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              JSON.parse(value);
            } catch (e) {
              throw new Error('Contact info must be valid JSON');
            }
          }
        }
      },
      comment: 'JSON containing contact details'
    },
    subscription_level: {
      type: Sequelize.STRING,
      defaultValue: 'Basic',
      validate: {
        isIn: [['Basic', 'Professional', 'Enterprise']]
      }
    },
    subscription_expires: {
      type: Sequelize.DATE
    },
    data_export_settings: {
      type: Sequelize.TEXT,
      defaultValue: JSON.stringify({
        allow_csv_export: true,
        allow_pdf_export: true,
        allow_property_export: true,
        allow_comp_export: true,
        require_approval: false,
        retention_period_days: 30
      }),
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              JSON.parse(value);
            } catch (e) {
              throw new Error('Data export settings must be valid JSON');
            }
          }
        }
      },
      comment: 'JSON containing data export control settings'
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

  return Organization;
};
