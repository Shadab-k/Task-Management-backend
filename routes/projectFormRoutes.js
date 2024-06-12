// routes/projects.js
const express = require("express");
const { body, validationResult } = require("express-validator");
const projectDetails = require("../models/projectDetails");
const fetchUser = require("../middleware/fetchUser");
const Task = require("../models/Task");
const router = express.Router();

router.post(
  "/project-post-details",
  fetchUser,
  [
    body("projectName").notEmpty().withMessage("Project Name cannot be blank"),
    body("projectDescription")
      .notEmpty()
      .withMessage("Project description cannot be blank"),
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

    const {
      projectName,
      projectDescription,
      startDate,
      endDate,
      developer,
      status,
    } = req.body;

    try {
      const projectData = await projectDetails.create({
        userId,
        project_name: projectName,
        project_description: projectDescription,
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


// PUT endpoint to update project details by project ID
router.put("/update-project/:projectId", fetchUser, async (req, res) => {
  const { projectId } = req.params;

  try {
    // Check if the project exists
    const project = await projectDetails.findByPk(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Update project details
    project.project_name = req.body.projectName;
    project.project_description = req.body.projectDescription;
    project.start_date = req.body.startDate;
    project.end_date = req.body.endDate;
    project.developer = req.body.developer;
    project.status = req.body.status;

    await project.save();

    res.status(200).json(project);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;

// DELETE endpoint to delete a project by its project ID
router.delete("/delete-project/:projectId", fetchUser, async (req, res) => {
  const { projectId } = req.params;

  try {
    // Check if the project exists
    const project = await projectDetails.findByPk(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Delete all tasks associated with the project
    await Task.destroy({ where: { project_id: projectId } });

    // Delete the project
    await project.destroy();

    res
      .status(200)
      .json({ message: "Project and associated tasks deleted successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});



module.exports = router;
