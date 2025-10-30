const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const mongoose = require("mongoose");
const authRoute = require("./routes/auth.route");
const usersRoute = require("./routes/user.route");
const attendancesRoute = require("./routes/attendance.route");
const degreesRoute = require("./routes/degree.route");

// Express Usages
dotenv.config();
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
const corsOptions = {
  origin: ["http://localhost:5173", "https://client-attend.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  exposedHeaders: ["Set-Cookie"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

// Database Config
mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("DB Work 😍"))
  .catch((err) => console.log(`Error ${err.message}`));

// MiddleWares
app.use("/api/auth", authRoute);
app.use("/api/users", usersRoute);
app.use("/api/attendances", attendancesRoute);
app.use("/api/degrees", degreesRoute);

app.listen(PORT, () => console.log(`Server Running on PORT ${PORT} 🥰`));
