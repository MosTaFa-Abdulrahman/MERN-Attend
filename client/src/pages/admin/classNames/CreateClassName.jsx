import { X } from "lucide-react";

// Hook-Form && Zod
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClassNameSchema } from "../../../validations/attendance/attendance.validation";

// Dummy-Data
import { classOptions } from "../../../dummyData";

// RTKQ
import { useCreateQRMutation } from "../../../store/attendance/attendanceSlice";
import toast from "react-hot-toast";

function CreateClassName({ isOpen, onClose }) {
  // RTKQ
  const [createQR, { isLoading }] = useCreateQRMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(createClassNameSchema),
    defaultValues: {
      className: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      await createQR(data).unwrap();
      toast.success("Class created successfully!");
      reset();
      onClose();
    } catch (error) {
      toast.error(error?.data?.error || "Failed to create class");
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-2xl p-6 m-4 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create New Class</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label
              htmlFor="className"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Class Name <span className="text-red-500">*</span>
            </label>
            <select
              id="className"
              {...register("className")}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none appearance-none ${
                errors.className
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              disabled={isLoading}
            >
              {classOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.className && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <span className="inline-block w-1 h-1 bg-red-600 rounded-full" />
                {errors.className.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Class"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateClassName;
