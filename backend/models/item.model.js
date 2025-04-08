module.exports = (sequelize, Sequelize) => {
  const Item = sequelize.define('item', {
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
    value: {
      type: Sequelize.FLOAT,
      defaultValue: 0
    },
    category: {
      type: Sequelize.STRING
    },
    priority: {
      type: Sequelize.INTEGER,
      defaultValue: 0
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

  return Item;
};
