import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../requestMethod";

export const userSlice = createApi({
  reducerPath: "usersApi",
  baseQuery: axiosBaseQuery({ baseUrl: "/users" }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    // Update User
    updateUser: builder.mutation({
      query: ({ id, ...userData }) => ({
        url: `/${id}`,
        method: "PUT",
        data: userData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "User", id: id }],
    }),

    // Get all users with pagination
    getAllUsers: builder.query({
      query: ({ page = 1, size = 10, search = "", className = "" }) => ({
        url: "/",
        method: "GET",
        params: {
          page,
          size,
          ...(search && { search }),
          ...(className && { className }),
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.content.map(({ _id }) => ({ type: "User", id: _id })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),

    // Get single User by ID
    getUserById: builder.query({
      query: (id) => ({
        url: `/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "User", id: id }],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
} = userSlice;
