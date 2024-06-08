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
    body("projectName").notEmpty().withMessage("Project Name cannot be blank"),
    body("startDate").isDate().withMessage("Enter a valid start date"),
    body("endDate").isDate().withMessage("Enter a valid end date"),
    body("developer").notEmpty().withMessage("Developer Name cannot be blank"),
    body("status").notEmpty().withMessage("Status cannot be blank"),
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

router.get("/is-first-login", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const projects = await projectDetails.findAll({ where: { userId } });
    const isFirstLogin = projects.length === 0;
    res.status(200).json({ isFirstLogin });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});


// PUT endpoint to update project details
router.put(
  "/update-project/:id",
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
    const { id } = req.params;
    const { projectName, startDate, endDate, developer, status } = req.body;

    try {
      const project = await projectDetails.findOne({ where: { id, userId } });

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      project.project_name = projectName;
      project.start_date = startDate;
      project.end_date = endDate;
      project.developer = developer;
      project.status = status;

      await project.save();

      res.status(200).json(project);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;


