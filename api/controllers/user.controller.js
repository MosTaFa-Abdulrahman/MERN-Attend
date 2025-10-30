const User = require("../models/User.model");

//  GET ALL Users
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;

    // Get distinct class names with their QR codes
    const skip = (page - 1) * size;

    const users = await User.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size);

    const totalElements = await User.countDocuments();
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

module.exports = {
  getAllUsers,
};
