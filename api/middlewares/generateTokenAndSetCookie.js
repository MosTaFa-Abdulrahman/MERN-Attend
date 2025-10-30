const jwt = require("jsonwebtoken");

const generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SEC, { expiresIn: "15d" });

  res.cookie("access_token", token, {
    httpOnly: true,
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    sameSite: "none", // Must be 'none' for cross-site requests in production
    secure: true, // Must be true when sameSite is 'none'
    path: "/",
  });

  return token;
};

module.exports = { generateTokenAndSetCookie };
