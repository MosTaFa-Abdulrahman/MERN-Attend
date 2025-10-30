import { useState } from "react";
import { Plus, Trash2, QrCode, Calendar, Users, BookOpen } from "lucide-react";
import { Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { NavLink } from "react-router-dom";

// Components
import CreateClassName from "./CreateClassName";

// RTKQ
import {
  useGetAttendancesQuery,
  useDeleteAttendanceMutation,
} from "../../../store/attendance/attendanceSlice";
import toast from "react-hot-toast";

function ClassNames() {
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data, isLoading, isFetching } = useGetAttendancesQuery({
    page: paginationModel.page + 1,
    size: paginationModel.pageSize,
  });

  const [deleteAttendance, { isLoading: isDeleting }] =
    useDeleteAttendanceMutation();

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this class?")) {
      try {
        await deleteAttendance(id).unwrap();
        toast.success("Class deleted successfully!");
      } catch (error) {
        toast.error(error?.data?.error || "Failed to delete class");
      }
    }
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

  // Columns with professional styling
  const columns = [
    {
      field: "className",
      headerName: "Class Name",
      flex: 1,
      minWidth: 250,
      renderCell: (params) => {
        const colors = getClassColor(params.value);
        return (
          <NavLink
            to={`/admin/class/${params?.value}`}
            className="flex items-center gap-3 py-2 w-full group"
          >
            <div
              className={`relative w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center shadow-sm ring-2 ring-white group-hover:scale-110 transition-transform`}
            >
              <BookOpen className={`w-6 h-6 ${colors.text}`} />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                {formatClassName(params.value)}
              </span>
              <span className="text-xs text-gray-500">{params.value}</span>
            </div>
          </NavLink>
        );
      },
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
      field: "createdBy",
      headerName: "Created By",
      width: 180,
      renderCell: (params) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <Users className="w-4 h-4 text-green-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">
              {params.value?.username || "N/A"}
            </span>
            <span className="text-xs text-gray-500">Admin</span>
          </div>
        </div>
      ),
    },
    {
      field: "createdAt",
      headerName: "Created Date",
      width: 200,
      renderCell: (params) => {
        const date = new Date(params.value);
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-orange-600" />
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDelete(params.row._id)}
            disabled={isDeleting}
            className="p-2.5 hover:bg-red-50 rounded-lg transition-all group disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-red-200"
            title="Delete class"
          >
            <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors" />
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Class Management
              </h1>
              <p className="text-gray-600">
                Manage all your classes and QR codes in one place
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Create New Class
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Classes</p>
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
                <QrCode className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active QR Codes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data?.totalElements || 0}
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

      {/* Create Modal */}
      <CreateClassName
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}

export default ClassNames;
