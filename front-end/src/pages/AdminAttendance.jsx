import React, { useEffect, useState } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { CalendarClock, AlertCircle, CalendarDays, X } from "lucide-react";
import AdminNavBar from "./AdminNavBar";

function AdminAttendance() {
  const [data, setData] = useState({ records: [] });
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const session = localStorage.getItem("sessionid")
  const [sessionId, setSessionId] = useState(session); // Default session_id for automatic fetch

  // Automatically fetch attendance when the component mounts
  useEffect(() => {
    if (sessionId) {
      fetchAttendance();
    }
  }, [sessionId]);

  const fetchAttendance = () => {
    if (!sessionId.trim()) return;

    setLoading(true);
    axios
      .post("http://localhost:5000/admin-attendance-records", {
        session_id: sessionId,
      })
      .then((response) => {
        setData({ records: response.data });
      })
      .catch((error) => {
        if (error.response && error.response.status === 404) {
          setData({ records: [] });
        } else {
          console.error("Something went wrong:", error);
        }
      })
      .finally(() => setLoading(false));
  };

  function getPeriod(timestamp) {
    const time = new Date(timestamp);
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    const periods = [
      { start: 525, end: 575, label: "Period 1" },
      { start: 575, end: 625, label: "Period 2" },
      { start: 640, end: 690, label: "Period 3" },
      { start: 690, end: 750, label: "Period 4" },
      { start: 810, end: 860, label: "Period 5" },
      { start: 860, end: 910, label: "Period 6" },
      { start: 925, end: 990, label: "Period 7" },
    ];

    for (const period of periods) {
      if (totalMinutes >= period.start && totalMinutes < period.end) {
        return period.label;
      }
    }
    return "Outside Period Time";
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });
  }

  const filteredRecords = selectedDate
    ? data.records.filter(
        (record) => formatDate(record.timestamp) === formatDate(selectedDate)
      )
    : data.records;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navbar */}
      <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm border-b">
        <AdminNavBar />
      </div>

      {/* Main Content */}
      <div className="flex-1 py-10 px-4 pt-28">
        <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
              <CalendarClock className="text-blue-600" size={24} />
              Attendance Overview
            </h1>

            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <input
                type="text"
                placeholder="Enter Session ID"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                className="border px-3 py-2 rounded-md text-sm w-60"
              />
              <button
                onClick={fetchAttendance}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Load Attendance
              </button>
              <button
                onClick={() => setShowCalendarModal(true)}
                className="flex items-center gap-2 text-blue-600 font-medium border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <CalendarDays size={18} />
                {selectedDate ? formatDate(selectedDate) : "Filter by Date"}
              </button>
              {selectedDate && (
                <button
                  className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                  onClick={() => setSelectedDate(null)}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Calendar Modal */}
          {showCalendarModal && (
            <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-xl shadow-lg relative max-w-sm w-full mx-4">
                <button
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowCalendarModal(false)}
                >
                  <X size={20} />
                </button>
                <h2 className="text-lg font-medium text-gray-800 mb-4">
                  Select Date
                </h2>
                <Calendar
                  onChange={(date) => {
                    setSelectedDate(date);
                    setShowCalendarModal(false);
                  }}
                  value={selectedDate}
                  maxDate={new Date()}
                  className="border-gray-200 rounded-lg"
                  tileClassName={({ date, view }) =>
                    view === "month" && formatDate(date) === formatDate(new Date())
                      ? "bg-blue-50 text-blue-600"
                      : null
                  }
                />
              </div>
            </div>
          )}

          {/* Attendance Table */}
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12 border border-gray-200 rounded-lg bg-gray-50">
              <AlertCircle className="mx-auto text-gray-400 mb-3" size={32} />
              <p className="text-gray-500">
                {selectedDate
                  ? "No records found for selected date"
                  : "No attendance records available"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faculty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.map((record, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.student_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.faculty_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(record.timestamp).toLocaleString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getPeriod(record.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminAttendance;
