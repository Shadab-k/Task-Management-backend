// config/db.js
const { Sequelize } = require("sequelize");

// Create a new Sequelize instance
const sequelize = new Sequelize("taskmanagement", "root", "", {
  host: "localhost",
  dialect: "mysql",
  logging: false,
});

// Test the connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");

    // Import models after the database connection is established
    const projectDetails = require("../models/projectDetails");

    // Sync models after importing
    await projectDetails.sync();
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

testConnection();

module.exports = sequelize;
