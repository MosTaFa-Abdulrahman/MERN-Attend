const router = require("express").Router();
const {
  createQR,
  scanQR,
  getAllQR,
  getAttendedStudentsByClass,
  myAttendance,
  getTodayAttendance,
  deleteQR,
} = require("../controllers/attendance.controller");
const {
  authenticate,
  roleBasedAccess,
} = require("../middlewares/protectedRoute");

// ADMIN ROUTES
router.post("/", authenticate, roleBasedAccess(["ADMIN"]), createQR);
router.delete("/:id", authenticate, roleBasedAccess(["ADMIN"]), deleteQR);
router.get("/all", authenticate, roleBasedAccess(["ADMIN"]), getAllQR);
router.get(
  "/today",
  authenticate,
  roleBasedAccess(["ADMIN"]),
  getTodayAttendance
);
router.get(
  "/class/:className",
  authenticate,
  roleBasedAccess(["ADMIN"]),
  getAttendedStudentsByClass
);

// STUDENT ROUTES
router.post("/scan", authenticate, scanQR);
router.get("/my", authenticate, myAttendance);

module.exports = router;
