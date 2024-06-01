const jwt = require("jsonwebtoken");
const User = require("../models/user");

const JWT_SECRET = "The User is Identified";

const fetchUser = async (req, res, next) => {
  try {
    const token = req.headers["auth-token"];
    // console.log("token", token);

    if (!token) {
      return res.status(401).send({ error: "Token not provided" });
    }

    const tokenParts = token.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
      return res.status(401).send({ error: "Invalid token format" });
    }

    const tokenValue = tokenParts[1];
    const data = jwt.verify(tokenValue, JWT_SECRET);
    // console.log("data after verification:", data);

    const user = await User.findByPk(data.user.id); // Fetch user from database

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    req.user = user; // Attach user object to request
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).send({ error: "Invalid token" });
  }
};

module.exports = fetchUser;