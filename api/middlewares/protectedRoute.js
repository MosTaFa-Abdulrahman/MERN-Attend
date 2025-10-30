const jwt = require("jsonwebtoken");
const User = require("../models/User.model.js");

const authenticate = async (req, res, next) => {
  try {
    const token =
      req.cookies.access_token ||
      (req.headers.authorization
        ? req.headers.authorization.replace("Bearer ", "")
        : null);

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No token provided" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SEC);

      const user = await User.findById(decoded.userId).select("-password");
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = user;
      next();
    } catch (jwtError) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error during authentication" });
  }
};

const roleBasedAccess = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Forbidden",
        userRole: req.user.role,
        requiredRoles: roles,
      });
    }
    next();
  };
};

module.exports = { authenticate, roleBasedAccess };
