// routes/projects.js
const express = require("express");
const { body, validationResult } = require("express-validator");
const fetchUser = require("../middleware/fetchUser");
const Task = require("../models/Task");
const router = express.Router();

// Route to add a task with projectId as a path parameter
router.post(
    "/add-task/:projectId",
    fetchUser,
    [
      body("taskName").notEmpty().withMessage("Task Name cannot be blank"),
      body("taskDescription")
        .notEmpty()
        .withMessage("Task description cannot be blank"),
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
      const { projectId } = req.params; // Extract projectId from path parameters
      const { taskName, taskDescription, developer, startDate, endDate, status } =
        req.body;
  
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
  
  // PUT endpoint to update a task by its task ID
  router.put("/update-task/:taskId", fetchUser, async (req, res) => {
    const { taskId } = req.params;
  
    try {
      // Check if the task exists
      const task = await Task.findByPk(taskId);
      const {taskName,taskDescription, startDate,endDate,developer ,status  } = req.body
  
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
  
      // Update task details if provided
      if (taskName !== undefined) {
        task.task_name = req.body.taskName;
      }
      if (taskDescription !== undefined) {
        task.task_description = req.body.taskDescription;
      }
      if (startDate !== undefined) {
        task.start_date = req.body.startDate;
      }
      if (endDate !== undefined) {
        task.end_date = req.body.endDate;
      }
      if (developer !== undefined) {
        task.developer = req.body.developer;
      }
      if (status !== undefined) {
        task.status = req.body.status;
      }
  
      await task.save();
  
      res.status(200).json(task);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  });
  
  // router.put("/update-task/:taskId", fetchUser, async (req, res) => {
  //   const { taskId } = req.params;
  
  //   try {
  //     // Check if the task exists
  //     const task = await Task.findByPk(taskId);
  
  //     if (!task) {
  //       return res.status(404).json({ message: "Task not found" });
  //     }
  
  //     // Update task details
  //     task.task_name = req.body.taskName;
  //     task.task_description = req.body.taskDescription;
  //     task.start_date = req.body.startDate;
  //     task.end_date = req.body.endDate;
  //     task.developer = req.body.developer;
  //     task.status = req.body.status;
  
  //     await task.save();
  
  //     res.status(200).json(task);
  //   } catch (error) {
  //     console.error(error.message);
  //     res.status(500).send("Server Error");
  //   }
  // });
  
  // DELETE endpoint to delete a task by its task ID
  router.delete("/delete-task/:taskId", fetchUser, async (req, res) => {
    const { taskId } = req.params;
  
    try {
      // Check if the task exists
      const task = await Task.findByPk(taskId);
  
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
  
      // Delete the task
      await task.destroy();
  
      res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  });

  module.exports = router