const { DataTypes } = require('sequelize');
const { sequelize } = require('../services/sequelize');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  text: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  pdfUrl: {
    type: DataTypes.STRING
  }
});

module.exports = Task;