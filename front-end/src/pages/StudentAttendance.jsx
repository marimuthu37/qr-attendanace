import React, { useEffect, useState } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  CalendarClock,
  AlertCircle,
  CalendarDays,
  X,
  CheckCircle,
  Percent,
  MinusCircle,
} from "lucide-react";
import StudentNavBar from "./StudentNavBar";

function StudentAttendance() {
  const [data, setData] = useState({ records: [], summary: {} });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const id = user?.id;

  useEffect(() => {
    axios
      .post("http://localhost:5000/get-attendence", { id })
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        if (error.response && error.response.status === 404) {
          setData({ records: [], summary: {} });
        } else {
          console.error("Something went wrong:", error);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  function formatDate(date) {
    return new Date(date).toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });
  }

  const periodList = [
    { label: "Period 1", start: 525, end: 575 },
    { label: "Period 2", start: 575, end: 625 },
    { label: "Period 3", start: 640, end: 690 },
    { label: "Period 4", start: 690, end: 750 },
    { label: "Period 5", start: 810, end: 860 },
    { label: "Period 6", start: 860, end: 910 },
    { label: "Period 7", start: 925, end: 990 },
  ];

  function getPeriodLabel(timestamp) {
    const time = new Date(timestamp);
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    for (const period of periodList) {
      if (totalMinutes >= period.start && totalMinutes < period.end) {
        return period.label;
      }
    }

    return "Outside Period Time";
  }

  const filteredRecords = selectedDate
    ? data.records.filter(
        (record) => formatDate(record.timestamp) === formatDate(selectedDate)
      )
    : data.records;

  const recordsByDate = {};
  filteredRecords.forEach((record) => {
    const dateKey = formatDate(record.timestamp);
    const period = getPeriodLabel(record.timestamp);
    if (!recordsByDate[dateKey]) {
      recordsByDate[dateKey] = {};
    }
    recordsByDate[dateKey][period] = record;
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#f0f8ff]">
      <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm border-b">
        <StudentNavBar />
      </div>

      <div className="flex-1 pt-28 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-6xl mx-auto bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
              <CalendarClock className="text-blue-600" size={24} />
              Attendance Records
            </h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCalendarModal(true)}
                className="flex items-center gap-2 text-blue-600 font-medium border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <CalendarDays size={18} />
                {selectedDate ? formatDate(selectedDate) : "Select Date"}
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

          {/* Summary Cards */}
          {!loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-green-100 text-green-800 shadow-sm flex flex-col items-center">
                <CheckCircle className="mb-1" />
                <p className="text-sm font-medium">Present</p>
                <p className="text-2xl font-bold">
                  {Math.round(Math.abs(data.summary?.present / 7))}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-red-100 text-red-800 shadow-sm flex flex-col items-center">
                <AlertCircle className="mb-1" />
                <p className="text-sm font-medium">Absent</p>
                <p className="text-2xl font-bold">
                  {Math.round((data.summary?.total - data.summary?.present) / 7)}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-100 text-gray-800 shadow-sm flex flex-col items-center">
                <MinusCircle className="mb-1" />
                <p className="text-sm font-medium">Total</p>
                <p className="text-2xl font-bold">
                  {Math.round(data.summary?.total / 7)}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-blue-100 text-blue-800 shadow-sm flex flex-col items-center">
                <Percent className="mb-1" />
                <p className="text-sm font-medium">Percentage</p>
                <p className="text-2xl font-bold">
                  {data.summary?.percentage !== undefined
                    ? Math.round(data.summary?.percentage)
                    : 0}
                  %
                </p>
              </div>
            </div>
          )}

          {showCalendarModal && (
            <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg relative w-full max-w-sm mx-4">
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
                />
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto w-full border border-gray-200 rounded-lg">
              <table className="min-w-full table-auto divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left">Period</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Faculty</th>
                    <th className="px-6 py-3 text-left">Time</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {periodList.map((period, idx) => {
                    const displayDate = selectedDate || new Date();
                    const dateKey = formatDate(displayDate);
                    const record = recordsByDate[dateKey]?.[period.label];
                    return (
                      <tr
                        key={idx}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-gray-800 font-medium">
                          {period.label}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {record ? (
                            <span className="text-green-600 font-semibold">
                              Present
                            </span>
                          ) : (
                            <span className="text-red-500">Absent</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-600 truncate max-w-[150px]">
                          {record?.faculty_id || "-"}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {record
                            ? new Date(record.timestamp).toLocaleTimeString(
                                "en-IN",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  timeZone: "Asia/Kolkata",
                                }
                              )
                            : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentAttendance;
