import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../requestMethod";

export const attendanceSlice = createApi({
  reducerPath: "attendancesApi",
  baseQuery: axiosBaseQuery({ baseUrl: "/attendances" }),
  tagTypes: ["Attendance"],

  endpoints: (builder) => ({
    // ADMIN ENDPOINTS

    // Create QR Code
    createQR: builder.mutation({
      query: (data) => ({
        url: "/",
        method: "POST",
        data,
      }),
      invalidatesTags: [{ type: "Attendance", id: "LIST" }],
    }),

    // Delete QR Code
    deleteAttendance: builder.mutation({
      query: (attendanceId) => ({
        url: `/${attendanceId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Attendance", id: "LIST" }],
    }),

    // Get all QR Codes with pagination (((ClassNames 🚀)))
    getAttendances: builder.query({
      query: ({ page = 1, size = 10 } = {}) => ({
        url: `/all?page=${page}&size=${size}`,
        method: "GET",
      }),
      providesTags: (result, error, arg) =>
        result?.data?.content
          ? [
              ...result.data.content.map(({ id }) => ({
                type: "Attendance",
                id,
              })),
              { type: "Attendance", id: "LIST" },
            ]
          : [{ type: "Attendance", id: "LIST" }],
      // CRITICAL FIX: Prevent refetch on window focus
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
      refetchOnReconnect: false,
    }),

    // GET ATTENDED STUDENTS BY CLASS NAME (ADMIN) - with pagination, month filter, and search ✅
    getAttendedStudentsByClass: builder.query({
      query: ({ className, page = 1, size = 10, month, search }) => {
        let url = `/class/${className}?page=${page}&size=${size}`;
        if (month) {
          url += `&month=${month}`;
        }
        if (search) {
          url += `&search=${encodeURIComponent(search)}`;
        }
        return {
          url,
          method: "GET",
        };
      },
      providesTags: (result, error, { className }) => [
        { type: "Attendance", id: `Attendance_${className}` },
        "Attendance",
      ],
    }),

    // NEW: Get single user's attendance (ADMIN ONLY) ✅
    getUserAttendance: builder.query({
      query: ({ userId, page = 1, size = 10, month }) => {
        let url = `/user/${userId}?page=${page}&size=${size}`;
        if (month) url += `&month=${month}`;
        return { url, method: "GET" };
      },
      providesTags: (result, error, { userId }) => [
        { type: "Attendance", id: `USER_${userId}` },
      ],
    }),

    // Get today's attendance
    getTodayAttendance: builder.query({
      query: ({ page = 1, size = 10 } = {}) => ({
        url: `/today?page=${page}&size=${size}`,
        method: "GET",
      }),
      providesTags: [{ type: "Attendance", id: "TODAY" }],
    }),

    // STUDENT ENDPOINTS

    // Scan QR Code - FIXED: Don't invalidate LIST tag to prevent refetch loop
    scanQR: builder.mutation({
      query: (data) => ({
        url: "/scan",
        method: "POST",
        data,
      }),
      // CRITICAL FIX: Only invalidate user-specific data, NOT the main list
      invalidatesTags: [
        { type: "Attendance", id: "MY" },
        { type: "Attendance", id: "TODAY" },
        // Removed: { type: "Attendance", id: "LIST" } - This was causing the loop!
      ],
    }),

    // Get my attendance
    myAttendance: builder.query({
      query: ({ page = 1, size = 10 } = {}) => ({
        url: `/my?page=${page}&size=${size}`,
        method: "GET",
      }),
      providesTags: [{ type: "Attendance", id: "MY" }],
    }),

    // Get single Attendance by ID (if needed)
    getAttendanceById: builder.query({
      query: (attendanceId) => ({
        url: `/${attendanceId}`,
        method: "GET",
      }),
      providesTags: (result, error, attendanceId) => [
        { type: "Attendance", id: attendanceId },
      ],
    }),
  }),
});

export const {
  // Admin hooks
  useCreateQRMutation,
  useDeleteAttendanceMutation,
  useGetAttendancesQuery,
  useGetAttendedStudentsByClassQuery,
  useGetTodayAttendanceQuery,

  // Student hooks
  useScanQRMutation,
  useMyAttendanceQuery,
  useGetUserAttendanceQuery,

  // Additional
  useGetAttendanceByIdQuery,
} = attendanceSlice;
