const router = require("express").Router();
const { authenticate } = require("../middlewares/protectedRoute");
const {
  register,
  login,
  logout,
  getProfile,
} = require("../controllers/auth.controller");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authenticate, getProfile);

module.exports = router;
