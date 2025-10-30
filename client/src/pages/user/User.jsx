import { useState, useEffect, useContext } from "react";
import {
  User as UserIcon,
  Mail,
  BookOpen,
  Calendar,
  Camera,
  Save,
  X,
  CalendarDays,
  Clock,
  TrendingUp,
} from "lucide-react";
import { DataGrid } from "@mui/x-data-grid";
import { Paper } from "@mui/material";
import { useParams } from "react-router-dom";
import upload from "../../upload";

// RTKQ && Context
import {
  useGetUserByIdQuery,
  useUpdateUserMutation,
} from "../../store/user/userSlice";
import { useGetUserAttendanceQuery } from "../../store/attendance/attendanceSlice";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

function UserPage() {
  const { id } = useParams();

  // Context
  const { currentUser } = useContext(AuthContext);

  // States
  const [isEditing, setIsEditing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  // Fetch user data
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useGetUserByIdQuery(id);

  // Fetch user's attendance
  const {
    data: attendanceData,
    isLoading: attendanceLoading,
    isFetching: attendanceFetching,
  } = useGetUserAttendanceQuery({
    userId: id,
    page: paginationModel.page + 1,
    size: paginationModel.pageSize,
    month: selectedMonth,
  });

  // Update mutation
  const [updateProfile, { isLoading: isUpdating }] = useUpdateUserMutation();

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    profilePic: "",
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        profilePic: user.profilePic || "",
      });
      setPreviewImage(user.profilePic || "");
    }
  }, [user]);

  // Handle image upload
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    try {
      setUploadingImage(true);
      const url = await upload(file);
      setFormData({ ...formData, profilePic: url });
      setPreviewImage(url);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload image");
      console.error(error);
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateProfile({ id, ...formData }).unwrap();
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      toast.error(err?.data?.error || "Failed to update profile");
    }
  };

  // Format class name
  const formatClassName = (className) => {
    if (!className) return "N/A";
    return className
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format time
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // DataGrid columns
  const columns = [
    {
      field: "attendedAt",
      headerName: "Date",
      width: 180,
      renderCell: (params) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">
              {formatDate(params.value)}
            </span>
            <span className="text-xs text-gray-500">
              {formatTime(params.value)}
            </span>
          </div>
        </div>
      ),
    },
    {
      field: "className",
      headerName: "Class",
      width: 150,
      renderCell: (params) => (
        <div className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg font-medium text-sm">
          {formatClassName(params.value)}
        </div>
      ),
    },
    {
      field: "qrCode",
      headerName: "QR Code",
      width: 150,
      renderCell: (params) => (
        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
          {params.value?.substring(0, 12)}...
        </span>
      ),
    },
    {
      field: "createdBy",
      headerName: "Created By",
      width: 150,
      renderCell: (params) => (
        <span className="text-sm text-gray-700">
          @{params.value?.username || "N/A"}
        </span>
      ),
    },
  ];

  // Rows
  const rows =
    attendanceData?.content?.map((item, index) => ({
      id: item._id || index,
      ...item,
    })) || [];

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">
            Error: {userError?.data?.error || "Failed to load user"}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            User Profile
          </h1>
          <p className="text-gray-600">
            View and manage user information and attendance
          </p>
        </div>

        {/* User Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center">
              <div className="relative">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-32 h-32 rounded-full object-cover ring-4 ring-blue-100 shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center ring-4 ring-blue-100 shadow-lg">
                    <span className="text-white font-bold text-4xl">
                      {user.firstName?.charAt(0)}
                      {user.lastName?.charAt(0)}
                    </span>
                  </div>
                )}

                {isEditing && (
                  <label className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                    <Camera className="w-5 h-5 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                )}
              </div>
              {uploadingImage && (
                <p className="text-xs text-blue-600 mt-2">Uploading...</p>
              )}
            </div>

            {/* User Info Section */}
            <div className="flex-1">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={isUpdating || uploadingImage}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {isUpdating ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          firstName: user.firstName || "",
                          lastName: user.lastName || "",
                          profilePic: user.profilePic || "",
                        });
                        setPreviewImage(user.profilePic || "");
                      }}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold text-gray-900">
                      {user.firstName} {user.lastName}
                    </h2>
                    {currentUser._id === user._id && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Username</p>
                        <p className="text-sm font-semibold text-gray-900">
                          @{user.username}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Class</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatClassName(user.className)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Joined</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatDate(user.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* First Section Attendances */}
        {(currentUser?.role === "ADMIN" || currentUser?._id === user?._id) && (
          <>
            {/* Attendance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <CalendarDays className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Total Attendance
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {attendanceData?.totalElements || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Clock className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Current Page
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {paginationModel.page + 1} /{" "}
                      {attendanceData?.totalPages || 1}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      This Month
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {selectedMonth ? attendanceData?.totalElements || 0 : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Filter */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">
                  Filter by Month:
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(e.target.value);
                    setPaginationModel({ ...paginationModel, page: 0 });
                  }}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-blue-400 focus:ring-blue-200 transition-all"
                />
                {selectedMonth && (
                  <button
                    onClick={() => setSelectedMonth("")}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Clear Filter
                  </button>
                )}
              </div>
            </div>

            {/* Attendance Table */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: 4,
                overflow: "hidden",
                border: "1px solid #e5e7eb",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              }}
            >
              <DataGrid
                rows={rows}
                columns={columns}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 25, 50]}
                rowCount={attendanceData?.totalElements || 0}
                paginationMode="server"
                loading={attendanceLoading || attendanceFetching}
                disableRowSelectionOnClick
                autoHeight
                sx={{
                  border: "none",
                  "& .MuiDataGrid-cell": {
                    borderBottom: "1px solid #f3f4f6",
                  },
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "#f9fafb",
                    borderBottom: "2px solid #e5e7eb",
                    fontWeight: 600,
                  },
                  "& .MuiDataGrid-row:hover": {
                    backgroundColor: "#f9fafb",
                  },
                }}
              />
            </Paper>
          </>
        )}

        {/* TODO: Second Section Degrees */}
        {/* TODO: Third Section Payments */}
      </div>
    </div>
  );
}

export default UserPage;
