module.exports = (sequelize, Sequelize) => {
  const Property = sequelize.define('property', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    org_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    // Property Characteristics (142 fields organized in JSON structures)
    identification: {
      type: Sequelize.TEXT,
      allowNull: true,
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              JSON.parse(value);
            } catch (e) {
              throw new Error('Identification must be valid JSON');
            }
          }
        }
      },
      comment: 'JSON containing 18 identification fields (APN, FIPS, tax ID, etc.)'
    },
    zoning: {
      type: Sequelize.TEXT,
      allowNull: true,
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              JSON.parse(value);
            } catch (e) {
              throw new Error('Zoning must be valid JSON');
            }
          }
        }
      },
      comment: 'JSON containing 22 zoning fields (primary zone, FAR, height, etc.)'
    },
    physical: {
      type: Sequelize.TEXT,
      allowNull: true,
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              JSON.parse(value);
            } catch (e) {
              throw new Error('Physical must be valid JSON');
            }
          }
        }
      },
      comment: 'JSON containing 45 physical attribute fields (year built, size, etc.)'
    },
    environmental: {
      type: Sequelize.TEXT,
      allowNull: true,
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              JSON.parse(value);
            } catch (e) {
              throw new Error('Environmental must be valid JSON');
            }
          }
        }
      },
      comment: 'JSON containing 27 environmental fields (flood zone, etc.)'
    },
    accessibility: {
      type: Sequelize.TEXT,
      allowNull: true,
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              JSON.parse(value);
            } catch (e) {
              throw new Error('Accessibility must be valid JSON');
            }
          }
        }
      },
      comment: 'JSON containing 30 accessibility fields (proximity, etc.)'
    },
    // Financial Information (93 fields organized in JSON structures)
    income: {
      type: Sequelize.TEXT,
      allowNull: true,
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              JSON.parse(value);
            } catch (e) {
              throw new Error('Income must be valid JSON');
            }
          }
        }
      },
      comment: 'JSON containing income statement and rent roll data (base rent, percentage rent, etc.)'
    },
    expenses: {
      type: Sequelize.TEXT,
      allowNull: true,
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              JSON.parse(value);
            } catch (e) {
              throw new Error('Expenses must be valid JSON');
            }
          }
        }
      },
      comment: 'JSON containing operating expenses (property taxes, insurance, maintenance, etc.)'
    },
    debt: {
      type: Sequelize.TEXT,
      allowNull: true,
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              JSON.parse(value);
            } catch (e) {
              throw new Error('Debt must be valid JSON');
            }
          }
        }
      },
      comment: 'JSON containing debt structure details (loan balance, interest rate, LTC, DSCR, etc.)'
    },
    valuations: {
      type: Sequelize.TEXT,
      allowNull: true,
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              JSON.parse(value);
            } catch (e) {
              throw new Error('Valuations must be valid JSON');
            }
          }
        }
      },
      comment: 'JSON containing valuation metrics (cap rate, NOI, terminal cap rate, etc.)'
    },
    // Tenant Information (61 fields per tenant organized in JSON structure)
    tenants: {
      type: Sequelize.TEXT,
      allowNull: true,
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              JSON.parse(value);
            } catch (e) {
              throw new Error('Tenants must be valid JSON');
            }
          }
        }
      },
      comment: 'JSON containing tenant details and lease terms (tenant name, lease dates, PSF rent, etc.)'
    },
    // Comparable Properties Data
    comps: {
      type: Sequelize.TEXT,
      allowNull: true,
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              JSON.parse(value);
            } catch (e) {
              throw new Error('Comps must be valid JSON');
            }
          }
        }
      },
      comment: 'JSON containing comparable properties data for valuation analysis'
    },
    // Adjustment Data for Comparable Analysis
    adjustments: {
      type: Sequelize.TEXT,
      allowNull: true,
      validate: {
        isValidJSON(value) {
          if (value) {
            try {
              JSON.parse(value);
            } catch (e) {
              throw new Error('Adjustments must be valid JSON');
            }
          }
        }
      },
      comment: 'JSON containing adjustment factors and data for comparable analysis'
    },
    // Additional tracking fields
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

  return Property;
};
