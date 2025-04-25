import React, { useState } from "react";
import axios from "axios";
import { Scanner } from "@yudiel/react-qr-scanner";

function MainPage() {
  const [scanResult, setScanResult] = useState(null);
  const [studentId, setStudentId] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState('');
  const [qrImage, setQrImage] = useState(null);
  const [sessionId, setSessionId] = useState('');
  const [isSessionCreated, setIsSessionCreated] = useState(false);

  const handleScan = (data) => {
    if (data) {
      setScanResult(data[0].rawValue); // The QR code data contains the sessionId or studentId
      markAttendance(data[0].rawValue); // Assuming data contains the sessionId
    }
  };

  const handleError = (err) => {
    console.error(err);
  };

  const markAttendance = async (sessionId) => {
    try {
      const studentData = { sessionId, studentId: 1 }; // Use real studentId
      const response = await axios.post('http://localhost:5000/mark-attendance', studentData);
      setAttendanceStatus(response.data.message);
    } catch (error) {
      console.error("Error marking attendance", error);
      setAttendanceStatus('Failed to mark attendance');
    }
  };

  const generateQRCode = async () => {
    try {
      const response = await axios.post('http://localhost:5000/create-session', {
        facultyId: 'F001', // Replace with actual faculty ID
        // courseName: 'Course 101', // Replace with actual course name
      });
      const qrCodeDataUrl = response.data.qrCode; // Get the base64-encoded QR code
      setSessionId(response.data.sessionId); // Store the session ID
      setQrImage(qrCodeDataUrl); // Store the QR code image data
      setIsSessionCreated(true); // Mark that session is created
    } catch (error) {
      console.error("Error generating session QR code", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-teal-400 to-blue-500 flex flex-col items-center justify-center text-white">
      <div className="text-center p-4">
        <h1 className="text-4xl font-bold mb-6">QR Code Attendance System</h1>

        <div className="mb-6">
          <h2 className="text-2xl mb-3">Scan QR Code to Mark Attendance</h2>
          <div className="w-full max-w-lg mx-auto">
            <Scanner
              delay={300}
              styles={{ container: { width: '100%' } }}
              onError={handleError}
              onScan={handleScan}
            />
          </div>
        </div>

        {scanResult && (
          <div className="bg-white text-black p-4 rounded-lg shadow-md w-full max-w-lg mx-auto">
            <h3 className="text-xl font-semibold">Attendance Marked for Session ID: {scanResult}</h3>
            <p>{attendanceStatus}</p>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-2xl mb-3">Generate Session QR Code</h2>
          <button
            onClick={generateQRCode}
            disabled={isSessionCreated}
            className="px-6 py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 focus:outline-none disabled:bg-gray-400"
          >
            {isSessionCreated ? "Session Created" : "Generate Session QR Code"}
          </button>
        </div>

        {qrImage && (
          <div className="mt-6 text-center">
            <h3 className="text-xl mb-4">Generated QR Code for Session:</h3>
            <img
              src={qrImage}
              alt="Generated QR Code"
              className="w-48 h-48 mx-auto rounded-lg shadow-lg"
            />
            <p className="text-white mt-2">Scan this code to mark attendance</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MainPage;
