import { useContext, useState, useEffect, useRef } from "react";
import {
  QrCode,
  Scan,
  X,
  Check,
  Calendar,
  Users,
  ChevronRight,
  Loader2,
} from "lucide-react";
import QRCode from "qrcode";
import { Html5Qrcode } from "html5-qrcode";

// Context && RTKQ
import { AuthContext } from "../../context/AuthContext";
import {
  useGetAttendancesQuery,
  useScanQRMutation,
} from "../../store/attendance/attendanceSlice";
import toast from "react-hot-toast";

function Home() {
  const { currentUser } = useContext(AuthContext);

  const { data, isLoading, isFetching } = useGetAttendancesQuery();
  const [scanQR, { isLoading: isScanning }] = useScanQRMutation();

  const [selectedClass, setSelectedClass] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [scanning, setScanning] = useState(false);
  const html5QrCodeRef = useRef(null);

  // Generate QR Code when class is selected
  useEffect(() => {
    if (selectedClass) {
      QRCode.toDataURL(selectedClass.qrCode, {
        width: 300,
        margin: 2,
        color: {
          dark: "#1e293b",
          light: "#ffffff",
        },
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => {
          console.error(err);
          toast.error("Failed to generate QR code");
        });
    } else {
      setQrCodeUrl("");
    }
  }, [selectedClass]);

  // Start QR Scanner
  const startScanner = async () => {
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode("qr-reader");
      }

      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        onScanSuccess,
        onScanFailure
      );
      setScanning(true);
    } catch (err) {
      toast.error("Failed to start camera. Please allow camera access.");
      console.error(err);
    }
  };

  // Stop QR Scanner
  const stopScanner = async () => {
    if (html5QrCodeRef.current && scanning) {
      try {
        await html5QrCodeRef.current.stop();
        setScanning(false);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Handle successful scan
  const onScanSuccess = async (decodedText) => {
    await stopScanner();

    try {
      const result = await scanQR({ qrCode: decodedText }).unwrap();
      toast.success(result.message || "Attendance recorded successfully! ✅");
      setShowScanner(false);
    } catch (error) {
      toast.error(error?.data?.error || "Failed to record attendance");
      setTimeout(() => {
        startScanner();
      }, 2000);
    }
  };

  const onScanFailure = (error) => {
    // Silent fail for continuous scanning
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  // Close scanner
  const closeScanner = async () => {
    await stopScanner();
    setShowScanner(false);
  };

  // Format class name
  const formatClassName = (className) => {
    return className
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading || isFetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          <p className="text-slate-600 font-medium">
            Loading attendance data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8 mt-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            Attendance System
          </h1>
          <p className="text-slate-600">
            Welcome back,{" "}
            <span className="font-semibold">{currentUser?.username}</span>
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm mb-1">Total Classes</p>
                <p className="text-3xl font-bold text-slate-800">
                  {data?.content?.length || 0}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm mb-1">Your Class</p>
                <p className="text-xl font-bold text-slate-800">
                  {currentUser?.className
                    ? formatClassName(currentUser.className)
                    : "N/A"}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm mb-1">Today</p>
                <p className="text-xl font-bold text-slate-800">
                  {formatDate(new Date())}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Check className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={() => setShowScanner(true)}
            disabled={isScanning}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Scan className="w-5 h-5" />
            Scan QR Code
          </button>
        </div>

        {/* Classes Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            Available Classes
          </h2>
          {data?.content?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.content.map((classItem) => (
                <button
                  key={classItem._id}
                  onClick={() => setSelectedClass(classItem)}
                  className="bg-white rounded-xl p-6 shadow-sm border-2 border-slate-200 hover:border-blue-500 transition-all duration-200 text-left group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-600 transition-colors">
                      <QrCode className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">
                    {formatClassName(classItem.className)}
                  </h3>
                  <p className="text-sm text-slate-600 mb-1">
                    Created by:{" "}
                    <span className="font-medium">
                      {classItem.createdBy?.username}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDate(classItem.createdAt)}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-200">
              <QrCode className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">No classes available</p>
              <p className="text-slate-500 text-sm mt-2">
                Check back later for attendance classes
              </p>
            </div>
          )}
        </div>

        {/* QR Code Modal */}
        {selectedClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl relative">
              <button
                onClick={() => setSelectedClass(null)}
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>

              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QrCode className="w-8 h-8 text-blue-600" />
                </div>

                <h3 className="text-2xl font-bold text-slate-800 mb-2">
                  {formatClassName(selectedClass.className)}
                </h3>

                <p className="text-slate-600 mb-6">
                  Created by:{" "}
                  <span className="font-medium">
                    {selectedClass.createdBy?.username}
                  </span>
                </p>

                {qrCodeUrl && (
                  <div className="bg-white p-4 rounded-xl border-2 border-slate-200 mb-4">
                    <img
                      src={qrCodeUrl}
                      alt="QR Code"
                      className="w-full max-w-xs mx-auto"
                    />
                  </div>
                )}

                <p className="text-sm text-slate-500 mb-4">
                  Scan this QR code to mark your attendance
                </p>

                <p className="text-xs text-slate-400">
                  Created on {formatDate(selectedClass.createdAt)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* QR Scanner Modal */}
        {showScanner && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl relative">
              <button
                onClick={closeScanner}
                className="absolute top-4 right-4 p-2 bg-white hover:bg-slate-100 rounded-lg transition-colors z-10"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>

              <div className="text-center mb-6">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Scan className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">
                  Scan QR Code
                </h3>
                <p className="text-slate-600">
                  Position the QR code within the frame
                </p>
              </div>

              <div className="relative">
                <div
                  id="qr-reader"
                  className="rounded-xl overflow-hidden border-4 border-blue-500"
                ></div>

                {!scanning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-100 rounded-xl">
                    <button
                      onClick={startScanner}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Scan className="w-5 h-5" />
                      Start Camera
                    </button>
                  </div>
                )}
              </div>

              <p className="text-sm text-slate-500 text-center mt-4">
                Make sure the QR code is well lit and clearly visible
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
