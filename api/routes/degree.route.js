const router = require("express").Router();
const {
  createExam,
  addDegree,
  myDegrees,
  deleteDegree,
  getStudentDegrees,
  getExamDegrees,
} = require("../controllers/degree.controller");
const {
  authenticate,
  roleBasedAccess,
} = require("../middlewares/protectedRoute");

// ADMIN ROUTES - Exams
router.post(
  "/exam/create",
  authenticate,
  roleBasedAccess(["ADMIN"]),
  createExam
);
router.get(
  "/exam/:examId",
  authenticate,
  roleBasedAccess(["ADMIN"]),
  getExamDegrees
);

// ADMIN ROUTES - Degrees
router.post("/add", authenticate, roleBasedAccess(["ADMIN"]), addDegree);
router.get(
  "/student/:userId",
  authenticate,
  roleBasedAccess(["ADMIN"]),
  getStudentDegrees
);
router.delete("/:id", authenticate, roleBasedAccess(["ADMIN"]), deleteDegree);

// STUDENT ROUTES
router.get("/my", authenticate, myDegrees);

module.exports = router;
