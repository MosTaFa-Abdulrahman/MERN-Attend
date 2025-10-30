import { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  BookOpen,
  Eye,
  Printer,
  Search,
  X,
  Filter,
} from "lucide-react";
import { Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// Dummy-Data
import { classOptions } from "../../../dummyData";

// RTKQ
import { useGetAllUsersQuery } from "../../../store/user/userSlice";

function UsersPage() {
  const navigate = useNavigate();

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [classNameFilter, setClassNameFilter] = useState("");

  // Reset to first page when filters change
  useEffect(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, [debouncedSearch, classNameFilter]);

  // Debounce effect - updates debouncedSearch after 500ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [searchInput]);

  // Fetch users with RTK Query
  const { data, isLoading, isFetching, error } = useGetAllUsersQuery({
    page: paginationModel.page + 1,
    size: paginationModel.pageSize,
    search: debouncedSearch,
    className: classNameFilter,
  });

  // Show error toast if query fails
  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message || "Failed to fetch users");
    }
  }, [error]);

  // Handle View
  const handleView = (user) => {
    toast.success(`Viewing ${user.firstName} ${user.lastName}`);
    navigate(`/users/${user._id}`);
  };

  // Handle Print
  const handlePrint = (user) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>User Details - ${user.firstName} ${user.lastName}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              padding: 40px; 
              background: #f5f5f5;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 { 
              color: #2563eb; 
              margin-bottom: 30px;
              padding-bottom: 15px;
              border-bottom: 3px solid #2563eb;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
              margin-top: 20px;
            }
            .info-item { 
              padding: 15px;
              background: #f9fafb;
              border-radius: 8px;
              border-left: 4px solid #2563eb;
            }
            .label { 
              font-weight: 600; 
              color: #6b7280;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              display: block;
              margin-bottom: 5px;
            }
            .value {
              color: #111827;
              font-size: 16px;
              font-weight: 500;
            }
            @media print {
              body { background: white; }
              .container { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>👤 User Details</h1>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Full Name</span>
                <span class="value">${user.firstName} ${user.lastName}</span>
              </div>
              <div class="info-item">
                <span class="label">Username</span>
                <span class="value">${user.username}</span>
              </div>
              <div class="info-item">
                <span class="label">Email</span>
                <span class="value">${user.email}</span>
              </div>
              <div class="info-item">
                <span class="label">Class</span>
                <span class="value">${formatClassName(user.className)}</span>
              </div>
              <div class="info-item">
                <span class="label">Role</span>
                <span class="value">${user.role}</span>
              </div>
              <div class="info-item">
                <span class="label">Created Date</span>
                <span class="value">${new Date(
                  user.createdAt
                ).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</span>
              </div>
            </div>
          </div>
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Format class name for display
  const formatClassName = (className) => {
    if (!className) return "N/A";
    return className
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Get class color based on level
  const getClassColor = (className) => {
    if (className?.includes("prep")) {
      return {
        bg: "bg-blue-100",
        text: "text-blue-600",
        ring: "ring-blue-200",
      };
    } else if (className?.includes("secondary")) {
      return {
        bg: "bg-purple-100",
        text: "text-purple-600",
        ring: "ring-purple-200",
      };
    }
    return {
      bg: "bg-gray-100",
      text: "text-gray-600",
      ring: "ring-gray-200",
    };
  };

  // Check if search is valid (3+ characters)
  const isSearchValid = searchInput.length >= 3 || searchInput.length === 0;

  // Columns with professional styling
  const columns = [
    {
      field: "fullName",
      headerName: "Student",
      flex: 1,
      minWidth: 250,
      renderCell: (params) => {
        const { firstName, lastName, username, profilePic } = params.row;
        return (
          <div className="flex items-center gap-3 py-2 w-full">
            <div className="relative w-11 h-11">
              {profilePic ? (
                <img
                  src={profilePic}
                  alt={`${firstName} ${lastName}`}
                  className="w-full h-full rounded-full object-cover ring-2 ring-white shadow-md"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center ring-2 ring-white shadow-md">
                  <span className="text-white font-bold text-sm">
                    {firstName?.charAt(0)}
                    {lastName?.charAt(0)}
                  </span>
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900 text-sm">
                {firstName} {lastName}
              </span>
              <span className="text-xs text-gray-500">@{username}</span>
            </div>
          </div>
        );
      },
    },
    {
      field: "email",
      headerName: "Email",
      width: 220,
      renderCell: (params) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <span className="text-red-600 font-bold text-xs">@</span>
          </div>
          <span className="text-sm text-gray-700">{params.value}</span>
        </div>
      ),
    },
    {
      field: "className",
      headerName: "Class",
      width: 180,
      renderCell: (params) => {
        const colors = getClassColor(params.value);
        return (
          <div className="flex items-center gap-2">
            <div
              className={`${colors.bg} ${colors.text} px-3 py-1.5 rounded-lg font-medium text-sm shadow-sm`}
            >
              {formatClassName(params.value)}
            </div>
          </div>
        );
      },
    },
    {
      field: "role",
      headerName: "Role",
      width: 130,
      renderCell: (params) => (
        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1.5 rounded-lg font-medium text-xs ${
              params.value === "ADMIN"
                ? "bg-orange-100 text-orange-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {params.value}
          </div>
        </div>
      ),
    },
    {
      field: "createdAt",
      headerName: "Joined Date",
      width: 180,
      renderCell: (params) => {
        const date = new Date(params.value);
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">
                {date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="text-xs text-gray-500">
                {date.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleView(params.row)}
            className="p-2 hover:bg-blue-50 rounded-lg transition-all group border border-transparent hover:border-blue-200"
            title="View details"
          >
            <Eye className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </button>
          <button
            onClick={() => handlePrint(params.row)}
            className="p-2 hover:bg-green-50 rounded-lg transition-all group border border-transparent hover:border-green-200"
            title="Print details"
          >
            <Printer className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
          </button>
        </div>
      ),
    },
  ];

  // Rows
  const rows =
    data?.content?.map((item) => ({
      id: item._id,
      ...item,
    })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                User Management
              </h1>
              <p className="text-gray-600">
                Manage all your students and staff in one place
              </p>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search Input */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by first name or last name (min 3 characters)..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className={`w-full pl-12 pr-12 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    !isSearchValid
                      ? "border-orange-300 focus:border-orange-400 focus:ring-orange-200 bg-orange-50"
                      : "border-gray-200 focus:border-blue-400 focus:ring-blue-200"
                  }`}
                />
                {searchInput && (
                  <button
                    onClick={() => setSearchInput("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
                {!isSearchValid && (
                  <p className="text-xs text-orange-600 mt-1.5 ml-1 font-medium">
                    ⚠️ Please enter at least 3 characters to search
                  </p>
                )}
              </div>

              {/* Class Filter */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Filter className="w-5 h-5 text-gray-400" />
                </div>
                <select
                  value={classNameFilter}
                  onChange={(e) => setClassNameFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-purple-400 focus:ring-purple-200 transition-all appearance-none bg-white cursor-pointer hover:border-purple-300"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: "right 0.5rem center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "1.5em 1.5em",
                  }}
                >
                  {classOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters Display */}
            {(debouncedSearch || classNameFilter) && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 flex-wrap">
                <span className="text-sm text-gray-600 font-medium">
                  Active Filters:
                </span>
                {debouncedSearch && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-1.5 hover:bg-blue-200 transition-colors">
                    Search: "{debouncedSearch}"
                    <X
                      className="w-3.5 h-3.5 cursor-pointer hover:text-blue-900"
                      onClick={() => setSearchInput("")}
                    />
                  </span>
                )}
                {classNameFilter && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium flex items-center gap-1.5 hover:bg-purple-200 transition-colors">
                    Class: {formatClassName(classNameFilter)}
                    <X
                      className="w-3.5 h-3.5 cursor-pointer hover:text-purple-900"
                      onClick={() => setClassNameFilter("")}
                    />
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all hover:scale-105 cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">
                  {data?.totalElements || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all hover:scale-105 cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Current Page
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {paginationModel.page + 1} / {data?.totalPages || 1}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all hover:scale-105 cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Page Size</p>
                <p className="text-3xl font-bold text-gray-900">
                  {paginationModel.pageSize} per page
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Grid */}
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
            pageSizeOptions={[5, 10, 25, 50, 100]}
            rowCount={data?.totalElements || 0}
            paginationMode="server"
            loading={isLoading || isFetching}
            disableRowSelectionOnClick
            autoHeight
            getRowHeight={() => "auto"}
            sx={{
              border: "none",
              "& .MuiDataGrid-cell": {
                borderBottom: "1px solid #f3f4f6",
                py: 2,
                display: "flex",
                alignItems: "center",
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f9fafb",
                borderBottom: "2px solid #e5e7eb",
                fontWeight: 600,
                fontSize: "0.875rem",
                color: "#374151",
              },
              "& .MuiDataGrid-row": {
                minHeight: "80px !important",
                maxHeight: "none !important",
                cursor: "pointer",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "#f0f9ff",
              },
              "& .MuiDataGrid-footerContainer": {
                borderTop: "2px solid #e5e7eb",
                backgroundColor: "#f9fafb",
              },
              "& .MuiDataGrid-virtualScroller": {
                overflow: "visible",
              },
            }}
          />
        </Paper>
      </div>
    </div>
  );
}

export default UsersPage;
