const Degree = require("../models/Degree.model");
const Exam = require("../models/Exam.model");
const User = require("../models/User.model");

// CREATE EXAM (ADMIN)
const createExam = async (req, res) => {
  try {
    const { examName, className, fullDegree } = req.body;

    // Check if exam already exists
    const existingExam = await Exam.findOne({ examName, className });
    if (existingExam) {
      return res.status(400).json({
        error: `Exam "${examName}" already exists for ${className} ❌`,
      });
    }

    const exam = new Exam({
      examName,
      className,
      fullDegree,
      createdBy: req.user._id,
    });

    await exam.save();

    res.status(201).json({
      message: "Exam created ✅",
      exam,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ADD DEGREE (ADMIN)
const addDegree = async (req, res) => {
  try {
    const { userId, examId, studentDegree } = req.body;

    // Check user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found ❌" });
    }

    // Check exam exists
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ error: "Exam not found ❌" });
    }

    // Check className matches
    if (user.className !== exam.className) {
      return res.status(400).json({
        error: `User is in ${user.className}, exam is for ${exam.className} ❌`,
      });
    }

    // Check if degree already exists
    const existingDegree = await Degree.findOne({ userId, examId });
    if (existingDegree) {
      return res.status(400).json({
        error: "Degree already added for this student in this exam ❌",
      });
    }

    // Validate degree
    if (studentDegree > exam.fullDegree) {
      return res.status(400).json({
        error: `Student degree cannot exceed ${exam.fullDegree} ❌`,
      });
    }

    const degree = new Degree({
      userId,
      examId,
      studentDegree,
      addedBy: req.user._id,
    });

    await degree.save();

    // Populate to return full data
    await degree.populate([
      { path: "userId", select: "username firstName lastName" },
      { path: "examId", select: "examName fullDegree className" },
    ]);

    res.status(201).json({
      message: "Degree added ✅",
      degree,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        error: "Degree already exists for this student in this exam ❌",
      });
    }
    res.status(500).json({ error: error.message });
  }
};

// GET ALL DEGREES FOR AN EXAM (ADMIN)
const getExamDegrees = async (req, res) => {
  try {
    const { examId } = req.params;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ error: "Exam not found ❌" });
    }

    const degrees = await Degree.find({ examId })
      .populate("userId", "username firstName lastName email")
      .populate("examId", "examName fullDegree className")
      .sort({ studentDegree: -1 }); // Highest first

    res.status(200).json({
      exam,
      totalStudents: degrees.length,
      degrees,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET STUDENT DEGREES (ADMIN)
const getStudentDegrees = async (req, res) => {
  try {
    const { userId } = req.params;

    const degrees = await Degree.find({ userId })
      .populate("userId", "username firstName lastName className")
      .populate("examId", "examName fullDegree className")
      .sort({ createdAt: -1 });

    if (degrees.length === 0) {
      return res
        .status(404)
        .json({ error: "No degrees found for this student" });
    }

    res.status(200).json(degrees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE DEGREE (ADMIN)
const deleteDegree = async (req, res) => {
  try {
    const { id } = req.params;

    const degree = await Degree.findByIdAndDelete(id);
    if (!degree) {
      return res.status(404).json({ error: "Degree not found ❌" });
    }

    res.status(200).json({ message: "Degree deleted ✅" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET MY DEGREES (Student)
const myDegrees = async (req, res) => {
  try {
    const userId = req.user._id;

    const degrees = await Degree.find({ userId })
      .populate("examId", "examName fullDegree className")
      .select("studentDegree createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json(degrees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createExam,
  addDegree,
  myDegrees,
  deleteDegree,
  getStudentDegrees,
  getExamDegrees,
};
