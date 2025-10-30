const User = require("../models/User.model");

//  GET ALL Users with search and filter ✅
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const search = req.query.search || "";
    const className = req.query.className || "";

    // Build query object
    const query = {};

    // Add search by firstName or lastName (minimum 3 characters)
    if (search && search.length >= 3) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
      ];
    }

    // Add className filter
    if (className) {
      query.className = className;
    }

    const skip = (page - 1) * size;

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size);

    const totalElements = await User.countDocuments(query);
    const totalPages = Math.ceil(totalElements / size);

    res.status(200).json({
      content: users,
      page,
      size,
      totalElements,
      totalPages,
      first: page === 1,
      last: page === totalPages,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET Single User by ID ✅
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE User Profile (firstName, lastName, profilePic only) ✅
const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, profilePic } = req.body;

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    // Build update object with only allowed fields
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName.trim();
    if (lastName !== undefined) updateData.lastName = lastName.trim();
    if (profilePic !== undefined) updateData.profilePic = profilePic.trim();

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error:
          "No valid fields to update. Allowed fields: firstName, lastName, profilePic",
      });
    }

    // Find and update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        new: true, // Return updated document
        runValidators: true, // Run schema validators
      }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      message: "User profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: "Validation error",
        details: error.message,
      });
    }
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserProfile,
};
