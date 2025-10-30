const Attendance = require("../models/Attendance.model");
const crypto = require("crypto");

// Generate QR Code
const generateQRCode = () => {
  return crypto.randomBytes(16).toString("hex");
};

// Helper: Check if date is today
const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
};

// CREATE QR CODE (ADMIN) ✅
const createQR = async (req, res) => {
  try {
    const { className } = req.body;

    const qrCode = generateQRCode();

    const attendance = new Attendance({
      className,
      qrCode,
      createdBy: req.user._id,
    });

    await attendance.save();

    res.status(201).json({
      message: "QR Created ✅",
      qrCode: attendance.qrCode,
      className: attendance.className,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//  GET ALL QR CODES (ADMIN) - Get all class names with pagination ✅
const getAllQR = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;

    // Get distinct class names with their QR codes
    const skip = (page - 1) * size;

    const attendances = await Attendance.find()
      .select("className qrCode createdAt createdBy")
      .populate("createdBy", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size);

    const totalElements = await Attendance.countDocuments();
    const totalPages = Math.ceil(totalElements / size);

    res.status(200).json({
      content: attendances,
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

// DELETE QR CODE (ADMIN) ✅
const deleteQR = async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await Attendance.findByIdAndDelete(id);
    if (!attendance) {
      return res.status(404).json({ error: "Not found" });
    }

    res.status(200).json({ message: "Deleted ✅" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ATTENDED STUDENTS BY CLASS NAME (ADMIN) - with pagination, month filter, and search ✅
const getAttendedStudentsByClass = async (req, res) => {
  try {
    const { className } = req.params;
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const month = req.query.month; // Format: "YYYY-MM" (e.g., "2025-10")
    const search = req.query.search; // Search by firstName or lastName

    if (!className) {
      return res.status(400).json({ error: "className is required" });
    }

    // Build the query
    const query = { className };

    // If month filter is provided, add date range to query
    if (month) {
      // Validate month format
      const monthRegex = /^\d{4}-\d{2}$/;
      if (!monthRegex.test(month)) {
        return res.status(400).json({
          error: "Invalid month format. Use YYYY-MM (e.g., 2025-10)",
        });
      }

      // Parse year and month
      const [year, monthNum] = month.split("-").map(Number);

      // Create start and end dates for the month
      const startDate = new Date(year, monthNum - 1, 1); // First day of month
      const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999); // Last day of month

      // Add date filter to query
      query.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    const attendances = await Attendance.find(query)
      .populate(
        "attendedStudents.userId",
        "username firstName lastName email profilePic className"
      )
      .populate("createdBy", "username")
      .sort({ createdAt: -1 });

    // Flatten all attended students from all QR codes of this class
    const allStudents = [];

    attendances.forEach((att) => {
      att.attendedStudents.forEach((student) => {
        // If month filter is applied, also filter individual attendance records
        let includeStudent = true;

        if (month) {
          const [year, monthNum] = month.split("-").map(Number);
          const attendedDate = new Date(student.attendedAt);

          // Check if the attendance is within the specified month
          includeStudent =
            attendedDate.getFullYear() === year &&
            attendedDate.getMonth() === monthNum - 1;
        }

        // If search filter is applied, filter by firstName or lastName
        if (includeStudent && search && student.userId) {
          const searchLower = search.toLowerCase().trim();
          const firstName = (student.userId.firstName || "").toLowerCase();
          const lastName = (student.userId.lastName || "").toLowerCase();
          const fullName = `${firstName} ${lastName}`;

          includeStudent =
            firstName.includes(searchLower) ||
            lastName.includes(searchLower) ||
            fullName.includes(searchLower);
        }

        if (includeStudent) {
          allStudents.push({
            _id: student._id,
            student: student.userId,
            attendedAt: student.attendedAt,
            qrCode: att.qrCode,
            qrCreatedAt: att.createdAt,
            createdBy: att.createdBy,
          });
        }
      });
    });

    // Sort by most recent attendance
    allStudents.sort((a, b) => new Date(b.attendedAt) - new Date(a.attendedAt));

    // Pagination
    const totalElements = allStudents.length;
    const totalPages = Math.ceil(totalElements / size);
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    const content = allStudents.slice(startIndex, endIndex);

    res.status(200).json({
      className,
      content,
      page,
      size,
      totalElements,
      totalPages,
      first: page === 1,
      last: page === totalPages,
      ...(month && { month }), // Include month in response if filtered
      ...(search && { search }), // Include search in response if filtered
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET TODAY'S ATTENDANCE (ADMIN) - with pagination
const getTodayAttendance = async (req, res) => {
  try {
    const { className } = req.query;
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const filter = className ? { className } : {};

    const attendances = await Attendance.find(filter).populate(
      "attendedStudents.userId",
      "username firstName lastName className"
    );

    const todayRecords = [];

    attendances.forEach((att) => {
      const todayStudents = att.attendedStudents.filter((s) =>
        isToday(s.attendedAt)
      );

      if (todayStudents.length > 0) {
        todayRecords.push({
          _id: att._id,
          className: att.className,
          qrCode: att.qrCode,
          todayStudents: todayStudents.map((s) => ({
            student: s.userId,
            attendedAt: s.attendedAt,
          })),
        });
      }
    });

    // Pagination
    const totalElements = todayRecords.length;
    const totalPages = Math.ceil(totalElements / size);
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    const content = todayRecords.slice(startIndex, endIndex);

    res.status(200).json({
      date: new Date().toDateString(),
      totalToday: todayRecords.reduce(
        (sum, r) => sum + r.todayStudents.length,
        0
      ),
      content,
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

// SCAN QR CODE (USER) - ONE SCAN PER DAY
const scanQR = async (req, res) => {
  try {
    const { qrCode } = req.body;
    const student = req.user;

    // Find attendance
    const attendance = await Attendance.findOne({ qrCode });
    if (!attendance) {
      return res.status(404).json({ error: "Invalid QR code ❌" });
    }

    // Check class match
    if (student.className !== attendance.className) {
      return res.status(403).json({
        error: `Wrong class! This is for ${attendance.className}, you are ${student.className} ❌`,
      });
    }

    // Check if student already attended TODAY
    const attendedToday = attendance.attendedStudents.some(
      (s) =>
        s.userId.toString() === student._id.toString() && isToday(s.attendedAt)
    );

    if (attendedToday) {
      return res.status(400).json({
        error: "You already attended today! ✅ Come back tomorrow 😊",
      });
    }

    // Add student attendance for today
    attendance.attendedStudents.push({
      userId: student._id,
      attendedAt: new Date(),
    });

    await attendance.save();

    res.status(200).json({
      message: "Attendance success ✅",
      className: attendance.className,
      attendedAt: new Date(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//  GET MY ATTENDANCE (USER) - with pagination
const myAttendance = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;

    const attendances = await Attendance.find({
      "attendedStudents.userId": userId,
    }).select("className attendedStudents createdAt");

    const myRecords = [];

    attendances.forEach((att) => {
      const records = att.attendedStudents.filter(
        (s) => s.userId.toString() === userId.toString()
      );

      records.forEach((record) => {
        myRecords.push({
          className: att.className,
          attendedAt: record.attendedAt,
          qrCreatedAt: att.createdAt,
        });
      });
    });

    // Sort by most recent
    myRecords.sort((a, b) => new Date(b.attendedAt) - new Date(a.attendedAt));

    // Pagination
    const totalElements = myRecords.length;
    const totalPages = Math.ceil(totalElements / size);
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    const content = myRecords.slice(startIndex, endIndex);

    res.status(200).json({
      content,
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
  createQR,
  scanQR,
  getAllQR,
  getAttendedStudentsByClass,
  myAttendance,
  getTodayAttendance,
  deleteQR,
};
