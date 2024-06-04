// routes/projects.js
const express = require("express");
const { body, validationResult } = require("express-validator");
const projectDetails = require("../models/projectDetails");
const fetchUser = require("../middleware/fetchUser");

const router = express.Router();

router.post(
  "/project-post-details",
  fetchUser,
  [
    body("projectName").notEmpty().withMessage("Enter a valid project name"),
    body("startDate").isDate().withMessage("Enter a valid start date"),
    body("endDate").isDate().withMessage("Enter a valid end date"),
    body("developer").notEmpty().withMessage("Enter a valid developer name"),
    body("status").notEmpty().withMessage("Status cannot be null"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;

    const { projectName, startDate, endDate, developer, status } = req.body;

    try {
      const projectData = await projectDetails.create({
        userId,
        project_name: projectName,
        start_date: startDate,
        end_date: endDate,
        developer,
        status,
      });
      res.status(201).json(projectData);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

// GET endpoint to fetch all project details
router.get("/get-project-form-details", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const allProjects = await projectDetails.findAll({ where: { userId } });
    res.status(200).json(allProjects);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});
module.exports = router;
