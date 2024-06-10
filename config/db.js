// config/db.js
const { Sequelize } = require("sequelize");

// Create a new Sequelize instance
const sequelize = new Sequelize("taskmanagement", "root", "", {
  host: "localhost",
  dialect: "mysql",
  // logging: false,
});

// Test the connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");

    // Import models after the database connection is established
    const projectDetails = require("../models/projectDetails");
    const User = require("../models/User");
    const Task = require("../models/Task");


    // Sync models after importing
    await User.sync()
    await projectDetails.sync();
    await Task.sync()
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

testConnection();

module.exports = sequelize;
