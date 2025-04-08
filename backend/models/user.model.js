module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define('user', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    auth0Id: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false
    },
    username: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false
    },
    email: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    role: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Client',
      validate: {
        isIn: [['Admin', 'Appraiser', 'Reviewer', 'Client']]
      }
    },
    orgId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Reference to the organization this user belongs to'
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: true
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: true
    },
    jobTitle: {
      type: Sequelize.STRING,
      allowNull: true
    },
    phone: {
      type: Sequelize.STRING,
      allowNull: true
    },
    lastLogin: {
      type: Sequelize.DATE
    },
    mfaEnabled: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
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

  return User;
};
