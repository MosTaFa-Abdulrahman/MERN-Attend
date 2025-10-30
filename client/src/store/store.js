import { configureStore } from "@reduxjs/toolkit";

// User
import { userSlice } from "./user/userSlice";
// Attendance
import { attendanceSlice } from "./attendance/attendanceSlice";

export const store = configureStore({
  reducer: {
    [userSlice.reducerPath]: userSlice.reducer,
    [attendanceSlice.reducerPath]: attendanceSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(userSlice.middleware)
      .concat(attendanceSlice.middleware),
});
