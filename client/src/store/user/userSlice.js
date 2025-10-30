import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../requestMethod";

export const userSlice = createApi({
  reducerPath: "usersApi",
  baseQuery: axiosBaseQuery({ baseUrl: "/users" }),
  tagTypes: ["User"],

  endpoints: (builder) => ({
    // Update User
    updateUser: builder.mutation({
      query: ({ userId, ...userData }) => ({
        url: `/${userId}`,
        method: "PUT",
        data: userData,
      }),

      invalidatesTags: (result, error, { userId }) => [
        { type: "User", id: userId },
      ],
    }),

    // Delete User
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `/${userId}`,
        method: "DELETE",
      }),

      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),

    // Get all users with pagination
    getUsers: builder.query({
      query: ({ page = 1, size = 10 } = {}) => ({
        url: `?page=${page}&size=${size}`,
        method: "GET",
      }),

      providesTags: (result, error, arg) =>
        result?.data?.content
          ? [
              ...result.data.content.map(({ id }) => ({ type: "User", id })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),

    // Get single User by ID
    getUserById: builder.query({
      query: (userId) => ({
        url: `/${userId}`,
        method: "GET",
      }),

      providesTags: (result, error, userId) => [{ type: "User", id: userId }],
    }),
  }),
});

export const {
  useDeleteUserMutation,
  useGetUserByIdQuery,
  useGetUsersQuery,
  useUpdateUserMutation,
} = userSlice;
