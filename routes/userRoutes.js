const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const crypto = require("crypto"); // Import the crypto module for MD5 hashing
const jwt = require("jsonwebtoken");
const fetchUser = require("../middleware/fetchUser");
const JWT_SECRET = "The User is Identified";

router.post(
  "/signup",
  [
    // Express-validator middleware for input validation
    body("name", "Please enter a valid name").exists(),
    body("email", "Please enter a valid email").isEmail(),
    body(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password } = req.body;

      // Check if the user with the provided email already exists
      let user = await User.findOne({ where: { email } });
      if (user) {
        return res
          .status(400)
          .json({ error: "User with this email already exists" });
      }

      // Hash the password using MD5
      const hashedPassword = crypto
        .createHash("md5")
        .update(password)
        .digest("hex");

      // Create a new user instance
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        // Add any other fields you want to save in the database
      });

      // Generate JWT token for the user
      const authToken = jwt.sign({ user: { id: user.id } }, JWT_SECRET);

      res.status(201).json({ authToken });
    } catch (error) {
      console.error("Error during user sign up:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// API For Login the User
router.post(
  "/signin",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      // Check if user with this username exists
      let user = await User.findOne({
        where: { email },
      });

      if (!user) {
        return res.status(400).json({ success, error: "Invalid email" });
      }

      const hashedPassword = crypto
        .createHash("md5")
        .update(password)
        .digest("hex");
      const isPasswordValid = hashedPassword === user.password;

      if (!isPasswordValid) {
        return res.status(400).json({ success, error: "Invalid password" });
      }

      if (!user && !isPasswordValid) {
        return res.status(400).json({ success, error: "Invalid credentials" });
      }

      const data = {
        user: {
          id: user.id,
        },
      };

      const authToken = jwt.sign(data, JWT_SECRET);
      success = true;

      res.json({ success, authToken });
      console.log("User logged in successfully:", user.email);
      console.log("Auth Token:", authToken);
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.post("/getuser", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id; // Ensure the fetchUser middleware sets req.user correctly
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] }, // Exclude the password field from the response
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// Route to change user password
router.post(
  "/change-password",
  fetchUser, // Middleware to fetch the user details
  [
    body("currentPassword", "Enter your current password").exists(),
    body("newPassword", "Enter a new password").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    try {
      // Find the user by ID
      const user = await User.findByPk(userId);
      if (!newPassword) {
        return res.status(401).json({
          error: "New password cannot be blank",
        });
      }
      if (newPassword.length > 11) {
        return res.status(401).json({
          error: "New password cannot be more than 11 characters long",
        });
      }
      if (currentPassword === "") {
        return res.status(401).json({
          error: "Current password cannot be blank",
        });
      }

      // Check if the current password matches the user's password
      const hashedCurrentPassword = crypto
        .createHash("md5")
        .update(currentPassword)
        .digest("hex");
      if (hashedCurrentPassword !== user.password) {
        return res.status(400).json({ error: "Incorrect current password" });
      }
      // Check if the new password is different from the current password
      if (currentPassword === newPassword) {
        return res.status(401).json({
          error: "New password cannot be the same as current password",
        });
      }

      // Check if user is allowed to change password
      if (user.status !== 1 || user.dc_user_profile_id !== 62) {
        return res.status(403).json({
          error: "User is not allowed to change password",
        });
      }

      // Update the user's password with the new password
      const hashedNewPassword = crypto
        .createHash("md5")
        .update(newPassword)
        .digest("hex");
      user.password = hashedNewPassword;
      await user.save();

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

module.exports = router;
