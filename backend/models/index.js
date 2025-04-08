const { Sequelize } = require('sequelize');
const path = require('path');

// Configure SQLite database
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database/valuelyst.sqlite'),
  logging: false
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.user = require('./user.model.js')(sequelize, Sequelize);
db.item = require('./item.model.js')(sequelize, Sequelize);
db.property = require('./property.model.js')(sequelize, Sequelize);
db.organization = require('./organization.model.js')(sequelize, Sequelize);
db.workflow = require('./workflow.model.js')(sequelize, Sequelize);

// Define relationships
// User-Item relationship
db.user.hasMany(db.item, { as: 'items' });
db.item.belongsTo(db.user, {
  foreignKey: 'userId',
  as: 'user',
});

// Organization-User relationship
db.organization.hasMany(db.user, { as: 'members' });
db.user.belongsTo(db.organization, {
  foreignKey: 'orgId',
  as: 'organization',
});

// Organization-Property relationship
db.organization.hasMany(db.property, { as: 'properties' });
db.property.belongsTo(db.organization, {
  foreignKey: 'org_id',
  as: 'organization',
});

// User-Property relationship (for created_by and updated_by)
db.property.belongsTo(db.user, {
  foreignKey: 'created_by',
  as: 'creator',
});

db.property.belongsTo(db.user, {
  foreignKey: 'updated_by',
  as: 'updater',
});

// Workflow relationships
db.property.hasMany(db.workflow, { as: 'workflows' });
db.workflow.belongsTo(db.property, {
  foreignKey: 'property_id',
  as: 'property',
});

// Workflow-User relationships
db.workflow.belongsTo(db.user, {
  foreignKey: 'assigned_to',
  as: 'assignee',
});

db.workflow.belongsTo(db.user, {
  foreignKey: 'reviewer_id',
  as: 'reviewer',
});

db.workflow.belongsTo(db.user, {
  foreignKey: 'client_id',
  as: 'client',
});

db.workflow.belongsTo(db.user, {
  foreignKey: 'created_by',
  as: 'creator',
});

db.workflow.belongsTo(db.user, {
  foreignKey: 'updated_by',
  as: 'updater',
});

module.exports = db;
