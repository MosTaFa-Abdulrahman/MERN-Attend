const router = require("express").Router();
const {
  getAllUsers,
  getUserById,
  updateUserProfile,
} = require("../controllers/user.controller");

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUserProfile);

module.exports = router;
