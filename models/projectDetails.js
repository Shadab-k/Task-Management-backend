const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require('../models/User')  

const projectDetails = sequelize.define(
  "projectDetails",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id'
      }
    },
    project_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    developer: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "project_details",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);
projectDetails.belongsTo(User, { foreignKey: 'userId', targetKey: 'id' });

module.exports = projectDetails;
