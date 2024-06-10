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
    body("projectDescription").notEmpty().withMessage("Project description cannot be blank"),
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

    const { projectName, projectDescription, startDate, endDate, developer, status } = req.body;

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


// PUT endpoint to update project details
router.put(
  "/update-project/:id",
  fetchUser,
  [
    body("projectName").notEmpty().withMessage("Enter a valid project name"),
    body("projectDescription").notEmpty().withMessage("Project description cannot be blank"),
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
    const { projectName, projectDescription, startDate, endDate, developer, status } = req.body;

    try {
      const project = await projectDetails.findOne({ where: { id, userId } });

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      project.project_name = projectName;
      project_description = projectDescription,
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

// Roter of POST for creating Task 




// router.post(
//   "/add-task",
//   fetchUser,
//   [
//     body("tasks").isArray().withMessage("Tasks should be an array"),
//     body("tasks.*.taskName").notEmpty().withMessage("Task Name cannot be blank"),
//     body("tasks.*.taskDescription").notEmpty().withMessage("Task description cannot be blank"),
//     body("tasks.*.developer").notEmpty().withMessage("Enter a valid developer name"),
//     body("tasks.*.startDate").isDate().withMessage("Enter a valid start date"),
//     body("tasks.*.endDate").isDate().withMessage("Enter a valid end date"),
//     body("tasks.*.status").notEmpty().withMessage("Status cannot be blank"),
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const userId = req.user.id;
//     const { projectId, tasks } = req.body;

//     try {
//       const taskData = tasks.map(task => ({
//         project_id: projectId,
//         task_name: task.taskName,
//         task_description: task.taskDescription,
//         start_date: task.startDate,
//         end_date: task.endDate,
//         developer: task.developer,
//         status: task.status,
//       }));

//       const createdTasks = await Task.bulkCreate(taskData);
//       res.status(201).json(createdTasks);
//     } catch (error) {
//       console.error(error.message);
//       res.status(500).send("Server Error");
//     }
//   }
// );

router.post(
  "/add-task",
  fetchUser,
  [
    body("projectId").notEmpty().withMessage("Project ID is required"),
    body("taskName").notEmpty().withMessage("Task Name cannot be blank"),
    body("taskDescription").notEmpty().withMessage("Task description cannot be blank"),
    body("developer").notEmpty().withMessage("Developer name cannot be blank"),
    body("startDate").isDate().withMessage("Enter a valid start date"),
    body("endDate").isDate().withMessage("Enter a valid end date"),
    body("status").notEmpty().withMessage("Status cannot be blank"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { projectId, taskName, taskDescription, developer, startDate, endDate, status } = req.body;

    try {
      const task = await Task.create({
        project_id: projectId,
        task_name: taskName,
        task_description: taskDescription,
        start_date: startDate,
        end_date: endDate,
        developer,
        status,
      });

      res.status(201).json(task);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

//Roter to GET all the tasks foa  specific project
router.get("/tasks/:projectId", fetchUser, async (req, res) => {
  const { projectId } = req.params;

  try {
    const tasks = await Task.findAll({ where: { project_id: projectId } });

    if (!tasks) {
      return res.status(404).json({ msg: "No tasks found for this project" });
    }

    res.status(200).json(tasks);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;


