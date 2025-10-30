import { useState, useEffect, useCallback } from "react";
import {
  QrCode,
  Calendar,
  Plus,
  Clock,
  Filter,
  Search,
  X,
  User,
} from "lucide-react";
import { Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useParams } from "react-router-dom";

// RTKQ
import { useGetAttendedStudentsByClassQuery } from "../../../store/attendance/attendanceSlice";

function Attendances() {
  const { className } = useParams();

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const [selectedMonth, setSelectedMonth] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Professional debouncing with 3 character minimum
  useEffect(() => {
    if (searchInput.length === 0 || searchInput.length >= 3) {
      const timer = setTimeout(() => {
        setSearchQuery(searchInput);
        setPaginationModel((prev) => ({ ...prev, page: 0 }));
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setSearchQuery("");
    }
  }, [searchInput]);

  const { data, isLoading, isFetching } = useGetAttendedStudentsByClassQuery({
    className,
    page: paginationModel.page + 1,
    size: paginationModel.pageSize,
    month: selectedMonth || undefined,
    search: searchQuery || undefined,
  });

  // Generate month options (last 12 months)
  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const value = `${year}-${month}`;
      const label = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });
      options.push({ value, label });
    }

    return options;
  };

  const monthOptions = generateMonthOptions();

  const handleClearFilters = useCallback(() => {
    setSelectedMonth("");
    setSearchInput("");
    setSearchQuery("");
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchInput("");
    setSearchQuery("");
  }, []);

  const handleClearMonth = useCallback(() => {
    setSelectedMonth("");
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, []);

  // Columns with professional styling
  const columns = [
    {
      field: "student",
      headerName: "Student",
      flex: 1,
      minWidth: 250,
      renderCell: (params) => (
        <div className="flex items-center gap-3 py-2">
          <div className="relative w-12 h-12 rounded-full overflow-hidden shadow-md ring-2 ring-white">
            {params.value?.profilePic ? (
              <img
                src={params.value.profilePic}
                alt={`${params.value.firstName} ${params.value.lastName}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center"
              style={{ display: params.value?.profilePic ? "none" : "flex" }}
            >
              <span className="text-white font-bold text-lg">
                {params.value?.firstName?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900 text-sm">
              {params.value?.firstName} {params.value?.lastName}
            </span>
            <span className="text-xs text-gray-500">
              @{params.value?.username || "N/A"}
            </span>
          </div>
        </div>
      ),
    },
    {
      field: "qrCode",
      headerName: "QR Code",
      width: 180,
      renderCell: (params) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <QrCode className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-800 font-mono font-medium">
              {params.value?.substring(0, 8)}...
            </span>
            <span className="text-xs text-gray-400">
              {params.value?.substring(params.value.length - 4)}
            </span>
          </div>
        </div>
      ),
    },
    {
      field: "attendedAt",
      headerName: "Attended At",
      width: 200,
      renderCell: (params) => {
        const date = new Date(params.value);
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-green-600" />
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
      field: "qrCreatedAt",
      headerName: "QR Created At",
      width: 200,
      renderCell: (params) => {
        const date = new Date(params.value);
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-purple-600" />
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
  ];

  // Rows
  const rows =
    data?.content?.map((item) => ({
      id: item._id,
      student: item.student,
      qrCode: item.qrCode,
      attendedAt: item.attendedAt,
      qrCreatedAt: item.qrCreatedAt,
    })) || [];

  // Check if search is active but needs more characters
  const searchNeedsMoreChars = searchInput.length > 0 && searchInput.length < 3;

  return (
    <div className="min-h-screen bg-gray-50 p-6 mt-11">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Student Attendents
              </h1>
              <p className="text-gray-600">
                Manage all your student attendents in one place
              </p>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Filters:
              </span>
            </div>

            {/* Search Input */}
            <div className="flex-1 min-w-[250px] max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by name (min 3 characters)..."
                  className={`w-full pl-10 pr-10 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                    searchNeedsMoreChars
                      ? "border-yellow-300 focus:ring-yellow-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                {searchInput && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {searchNeedsMoreChars && (
                <p className="text-xs text-yellow-600 mt-1 ml-1 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-yellow-600"></span>
                  Type at least 3 characters to search ({3 - searchInput.length}{" "}
                  more)
                </p>
              )}
            </div>

            {/* Month Dropdown */}
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setPaginationModel((prev) => ({ ...prev, page: 0 }));
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value="">All Months</option>
              {monthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Clear All Filters */}
            {(selectedMonth || searchQuery) && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear All Filters
              </button>
            )}
          </div>

          {/* Active Filters Display */}
          {(selectedMonth || searchQuery) && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500 font-medium">
                Active filters:
              </span>
              {searchQuery && (
                <span className="px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full flex items-center gap-2 shadow-sm">
                  <Search className="w-3 h-3" />
                  Search: "{searchQuery}"
                  <button
                    onClick={handleClearSearch}
                    className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedMonth && (
                <span className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-2 shadow-sm">
                  <Calendar className="w-3 h-3" />
                  {monthOptions.find((m) => m.value === selectedMonth)?.label}
                  <button
                    onClick={handleClearMonth}
                    className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {selectedMonth || searchQuery ? "Filtered" : "Total"}{" "}
                  Attendants
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {data?.totalElements || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Page</p>
                <p className="text-2xl font-bold text-gray-900">
                  {paginationModel.page + 1} / {data?.totalPages || 1}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Plus className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Page Size</p>
                <p className="text-2xl font-bold text-gray-900">
                  {paginationModel.pageSize}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Grid */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid #e5e7eb",
          }}
        >
          <DataGrid
            rows={rows}
            columns={columns}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 25, 50]}
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
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "#f9fafb",
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

export default Attendances;
