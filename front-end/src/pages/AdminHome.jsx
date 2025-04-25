import React, { useState } from "react";
import axios from "axios";
import { QrCode, Loader2, Clock, Copy, Check } from "lucide-react";
import AdminNavBar from "./AdminNavBar";

function AdminDashboard() {
  const [qrImage, setQrImage] = useState(null);
  const [sessionId, setSessionId] = useState("");
  const [otp, setOtp] = useState("");
  const [isSessionCreated, setIsSessionCreated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(null);
  const [copied, setCopied] = useState({ sessionId: false, otp: false });

  const user = JSON.parse(localStorage.getItem("user"));
  const id = user?.id;

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [type]: true });
    setTimeout(() => setCopied({ ...copied, [type]: false }), 2000);
  };

  const generateQRCode = async () => {
    const now = new Date();
    const startTime = new Date();
    startTime.setHours(8, 45, 0); // 8:45 AM
    const endTime = new Date();
    endTime.setHours(24, 30, 0); // 4:30 PM

    if (now < startTime || now > endTime) {
      alert("QR code can only be generated between 8:45 AM and 4:30 PM.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post("http://localhost:5000/create-session", {
        facultyId: id,
      });

      const { sessionId, qrCode, otp } = response.data;
      setSessionId(sessionId);
      setQrImage(qrCode);
      setOtp(otp);
      localStorage.setItem("sessionid", sessionId);
      setIsSessionCreated(true);

      // Start 30-second timer
      let count = 30;
      setTimer(count);
      const countdown = setInterval(() => {
        count -= 1;
        setTimer(count);
        if (count <= 0) {
          clearInterval(countdown);
          resetSession();
        }
      }, 1000);
    } catch (error) {
      console.error("Error generating session QR code", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetSession = () => {
    setQrImage(null);
    setSessionId("");
    setOtp("");
    setIsSessionCreated(false);
    setTimer(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <AdminNavBar />
      </div>

      <main className="py-8 px-4 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <QrCode size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">Attendance Session</h1>
                <p className="text-gray-500 text-sm">
                  Generate QR codes for student attendance
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-6">
              {/* Generate Button */}
              <button
                onClick={generateQRCode}
                disabled={isSessionCreated || isLoading}
                className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                  isSessionCreated
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                    : isLoading
                    ? "bg-blue-500 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Creating Session...
                  </>
                ) : isSessionCreated ? (
                  "Session Active"
                ) : (
                  "Generate QR Code"
                )}
              </button>

              {/* QR Code Display */}
              {qrImage && (
                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-800">QR Code</h3>
                      {timer !== null && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock size={14} />
                          <span>Expires in {timer}s</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-center">
                      <img
                        src={qrImage}
                        alt="Generated QR Code"
                        className="w-64 h-64 rounded-lg border border-gray-200 p-2"
                      />
                    </div>
                  </div>

                  {/* Session Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-800 mb-2">Session ID</h3>
                      <div className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                        <code className="text-sm font-mono text-gray-700 truncate">
                          {sessionId}
                        </code>
                        <button
                          onClick={() => copyToClipboard(sessionId, 'sessionId')}
                          className="text-gray-500 hover:text-blue-600 transition-colors"
                        >
                          {copied.sessionId ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-800 mb-2">OTP Code</h3>
                      <div className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                        <code className="text-sm font-mono text-red-600 font-bold">
                          {otp}
                        </code>
                        <button
                          onClick={() => copyToClipboard(otp, 'otp')}
                          className="text-gray-500 hover:text-blue-600 transition-colors"
                        >
                          {copied.otp ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <h3 className="font-medium text-blue-800 mb-2">Instructions</h3>
                    <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                      <li>Display this QR code for students to scan</li>
                      <li>Alternatively, share the OTP code with students</li>
                      <li>The session will automatically expire after 30 seconds</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;