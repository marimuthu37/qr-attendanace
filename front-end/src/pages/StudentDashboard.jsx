import React, { useState, useEffect } from "react";
import axios from "axios";
import { Scanner } from "@yudiel/react-qr-scanner";
import StudentNavBar from "./StudentNavBar";
import {
  Loader2,
  CheckCircle,
  AlertTriangle,
  QrCode,
  KeyRound,
} from "lucide-react";

function StudentDashboard() {
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("qr");
  const [scanActive, setScanActive] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const studentId = user?.id;

  const markAttendance = async (sessionId) => {
    try {
      setLoading(true);
      setStatus("");
      const res = await axios.post("http://localhost:5000/mark-attendance", {
        sessionId,
        studentId,
      });
      setStatus(res.data.message || "Attendance marked successfully");
      setScanActive(false);
    } catch (err) {
      setStatus(err.response?.data?.message || "Failed to mark attendance");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (!otp) return;
    try {
      setLoading(true);
      setStatus("Verifying OTP...");
      const res = await axios.post("http://localhost:5000/verify-otp", { otp });

      const sessionId = res.data.sessionId;
      if (!sessionId) {
        setStatus("❌ Invalid OTP: session not found");
        return;
      }

      await markAttendance(sessionId);
    } catch (err) {
      const msg = err.response?.data?.message || "❌ OTP verification failed";
      setStatus(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = (data) => {
    if (data && scanActive && !loading) {
      const sessionId = data[0].rawValue;
      markAttendance(sessionId);
    }
  };

  const resetScanner = () => {
    setStatus("");
    setScanActive(true);
  };

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode) {
      setDarkMode(JSON.parse(savedMode));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900 text-white" : "bg-[#f0f8ff] text-gray-800"
      }`}
    >
      <div className="fixed top-0 w-full z-50 shadow-sm bg-white/80 backdrop-blur-md border-b border-gray-200">
        <StudentNavBar />
      </div>

      <main className="pt-28 px-4 sm:px-6 md:px-8 lg:px-10 max-w-2xl mx-auto">
        <div
          className={`p-6 sm:p-8 rounded-2xl shadow-lg border ${
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
          }`}
        >
          <div className="text-center mb-6 sm:mb-8">
            <h2
              className={`text-2xl sm:text-3xl font-bold mb-2 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Attendance Portal
            </h2>
            <p
              className={`text-sm sm:text-base ${
                darkMode ? "text-gray-300" : "text-gray-500"
              }`}
            >
              {activeTab === "qr"
                ? "Scan the QR code to mark your attendance"
                : "Enter the OTP provided by your faculty"}
            </p>
          </div>

          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="inline-flex bg-gray-100 p-1 rounded-full">
              <button
                className={`px-4 sm:px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${
                  activeTab === "qr"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => {
                  setActiveTab("qr");
                  resetScanner();
                }}
              >
                <QrCode size={18} />
                QR Code
              </button>
              <button
                className={`px-4 sm:px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${
                  activeTab === "otp"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => setActiveTab("otp")}
              >
                <KeyRound size={18} />
                OTP
              </button>
            </div>
          </div>

          <div className="mb-6 sm:mb-8">
            {activeTab === "qr" ? (
              <div className="flex flex-col items-center">
                <div className="relative w-full aspect-square max-w-[300px] sm:max-w-sm rounded-2xl overflow-hidden border-2 border-gray-200 shadow-inner bg-black">
                  {scanActive ? (
                    <>
                      <Scanner
                        onScan={handleScan}
                        options={{
                          delayBetweenScanAttempts: 500,
                          constraints: {
                            facingMode: "environment",
                            focusMode: "continuous",
                          },
                        }}
                        styles={{
                          container: {
                            position: "relative",
                            width: "100%",
                            height: "100%",
                          },
                          video: {
                            objectFit: "cover",
                            width: "100%",
                            height: "100%",
                          },
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative w-64 h-64 max-w-full max-h-full">
                          <div className="absolute inset-0 border-4 border-blue-400 rounded-lg opacity-80"></div>
                          <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                          <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                          <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                          <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-400 animate-scan-line rounded-full"></div>
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-0 right-0 text-center text-white/90 text-xs sm:text-sm px-2">
                        Align QR code within the frame
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900/90 text-white p-4">
                      {status ? (
                        <>
                          {status.toLowerCase().includes("success") ? (
                            <CheckCircle size={48} />
                          ) : (
                            <AlertTriangle size={48} />
                          )}
                          <p className="mt-4 text-center text-sm">{status}</p>
                        </>
                      ) : (
                        <Loader2 size={48} className="animate-spin" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-full max-w-sm">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full p-3 text-gray-900 border border-gray-300 rounded-lg focus:outline-none"
                    placeholder="Enter OTP"
                  />
                </div>
                <button
                  onClick={handleOtpSubmit}
                  className="mt-4 sm:mt-6 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-all"
                >
                  Submit OTP
                </button>
                {status && (
                  <p
                    className={`text-center mt-4 text-sm ${
                      status.includes("success")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {status}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default StudentDashboard;
