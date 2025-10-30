const User = require("../models/User.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Helper Method
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SEC, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Register
const register = async (req, res) => {
  try {
    // Check User
    const { email, username, className, role } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Validate className for regular users
    if (role === "USER" && !className) {
      return res
        .status(400)
        .json({ error: "Class name is required for users" });
    }

    const user = await User.findOne({ $or: [{ email }, { username }] });

    if (user) {
      return res.status(400).json({ error: "User already exists 🙄🧐" });
    } else {
      const hashPassword = await bcrypt.hash(req.body.password, 10);

      const newUser = new User({ ...req.body, password: hashPassword });
      await newUser.save();

      if (newUser) {
        const token = generateToken(newUser._id);

        res.status(200).json({
          _id: newUser._id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          username: newUser.username,
          email: newUser.email,
          profilePic: newUser.profilePic,
          className: newUser.className,
          role: newUser.role,
          // token,
        });
      } else res.status(400).json({ error: "Invalid user data 😥" });
    }
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(400).json({ error: "User Not Found 🙄🧐" });
    } else {
      const validatePassword = bcrypt.compareSync(
        req.body.password,
        user.password
      );
      if (!validatePassword) {
        return res.status(404).json({ error: "Wrong Password 😥" });
      } else {
        const token = generateToken(user._id);

        res.status(200).json({
          _id: user._id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profilePic: user.profilePic,
          className: user.className,
          role: user.role,
          token,
        });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    res.cookie("token", "", { maxAge: 1 });
    res.status(200).json({ message: "User logged out successfully 😍" });
  } catch (error) {
    res.status(500).json({ error: "Logout failed" });
  }
};

// Get Profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "_id username email firstName lastName profilePic role className createdAt"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Get Profile error:", error);
    res.status(500).json({ error: "Error Get Profile !!!" });
  }
};

module.exports = { register, login, logout, getProfile };
