const express = require("express");
const QRCode = require("qrcode");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const mysql = require("mysql2");
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err.stack);
    return;
  }
  console.log("Connected to MySQL database");
});

app.post('/check-user', (req, res) => {
  const { email } = req.body;

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) return res.status(500).json({ error: 'DB error' });

    if (results.length > 0) {
      const user = results[0];
      return res.json({
        exists: true,
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      });
    } else {
      return res.json({ exists: false });
    }
  });
});

app.post('/manual-login', (req, res) => {
  const { email, password } = req.body;

  console.log("Login request:", email, password); 

  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error("MySQL error:", err); 
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const user = results[0];
    return res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      }
    });
  });
});

app.post("/create-session", async (req, res) => {
  const { facultyId} = req.body;
  const sessionId = `session-${Date.now()}`;
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); 
  const createdAt = new Date(); 
  const expiryTime = new Date(createdAt.getTime() + 10 * 3000); 

  try {
    const qrCodeDataUrl = await QRCode.toDataURL(sessionId);

    const query =
      "INSERT INTO sessions (session_id, faculty_id, qr_code_url, otp, created_at, expiry_time) VALUES ( ?, ?, ?, ?, ?, ?)";
    db.query(
      query,
      [sessionId, facultyId,  qrCodeDataUrl, otp, createdAt, expiryTime], 
      (err, result) => {
        if (err) {
          console.error("Error creating session:", err);
          return res.status(500).json({ message: "Failed to create session" });
        }

        res.status(200).json({
          message: "Session created successfully",
          sessionId,
          qrCode: qrCodeDataUrl,
          otp,
        });
      }
    );
  } catch (error) {
    console.error("Error generating QR code:", error);
    res.status(500).json({ message: "Failed to generate QR code" });
  }
});

app.post("/mark-attendance", (req, res) => {
  const { sessionId, studentId } = req.body;
  const timestamp = new Date(); 

  if (!sessionId || !studentId) {
    return res.status(400).json({ message: "Missing session or student ID" });
  }

  const minutesSinceMidnight = timestamp.getHours() * 60 + timestamp.getMinutes();

  const periods = [
    { start: 525, end: 575, label: "Period 1" },
    { start: 575, end: 625, label: "Period 2" },
    { start: 640, end: 690, label: "Period 3" },
    { start: 690, end: 750, label: "Period 4" },
    { start: 810, end: 860, label: "Period 5" },
    { start: 860, end: 910, label: "Period 6" },
    { start: 925, end: 990, label: "Period 7" },
  ];

  const currentPeriod = periods.find(
    (period) => minutesSinceMidnight >= period.start && minutesSinceMidnight < period.end
  );

  if (!currentPeriod) {
    return res.status(400).json({ message: "Attendance not allowed outside of defined periods" });
  }

  const checkAttendance = `
    SELECT * FROM attendance 
    WHERE student_id = ? AND timestamp BETWEEN ? AND ?
  `;

  const today = new Date();
  today.setSeconds(0);
  today.setMilliseconds(0);

  const periodStart = new Date(today);
  periodStart.setHours(Math.floor(currentPeriod.start / 60));
  periodStart.setMinutes(currentPeriod.start % 60);

  const periodEnd = new Date(today);
  periodEnd.setHours(Math.floor(currentPeriod.end / 60));
  periodEnd.setMinutes(currentPeriod.end % 60);

  db.query(checkAttendance, [studentId, periodStart, periodEnd], (err, results) => {
    if (results.length > 0) {
      return res.status(400).json({ message: "Attendance already marked for this period" });
    }

    const checkSession = "SELECT * FROM sessions WHERE session_id = ?";
    db.query(checkSession, [sessionId], (err, sessions) => {
      if (sessions.length === 0) {
        return res.status(404).json({ message: "Session not found" });
      }

      const { expiry_time } = sessions[0];
      const sessionExpiryTime = new Date(expiry_time);

      if (timestamp > sessionExpiryTime) {
        return res.status(400).json({ message: "Session has expired. Attendance cannot be marked" });
      }

      // Insert attendance
      const insert = "INSERT INTO attendance (session_id, student_id, timestamp) VALUES (?, ?, ?)";
      db.query(insert, [sessionId, studentId, timestamp], (err) => {
        if (err) return res.status(500).json({ message: "Failed to mark attendance" });

        res.status(200).json({ message: "Attendance marked successfully", studentId, sessionId });
      });
    });
  });
});

app.post("/verify-otp", (req, res) => {
  const { otp } = req.body;
  console.log("Received OTP for verification:", otp);


  const query = "SELECT session_id FROM sessions WHERE otp = ?";
  db.query(query, [otp], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: "Invalid OTP" });
    }

    res.status(200).json({ sessionId: results[0].session_id });
  });
});

app.post("/get-attendence", (req, res) => {
  const { id } = req.body;
  console.log("Received /get-attendence call from:", req.body);

  const userQuery = "SELECT * FROM users WHERE id = ?";
  db.query(userQuery, [id], (err, userResult) => {
    if (err || userResult.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const startDate = new Date("2025-04-24T00:00:00.000Z"); // UTC midnight
    const formattedDate = startDate.toISOString().slice(0, 19).replace('T', ' ');

    const joinQuery = `
      SELECT a.timestamp, s.faculty_id
      FROM attendance a
      JOIN sessions s ON a.session_id = s.session_id
      WHERE a.student_id = ? AND a.timestamp >= ?
      ORDER BY a.timestamp DESC
    `;

    db.query(joinQuery, [id, formattedDate], (err, results) => {
      if (err) {
        console.error("Error fetching attendance:", err);
        return res.status(500).json({ message: "Attendance fetch failed" });
      }

      const totalDays = new Set(results.map(r => new Date(r.timestamp).toDateString())).size;
      const periodsPerDay = 7;
      const totalPeriods = totalDays * periodsPerDay;
      const presentPeriods = results.length;
      const absentPeriods = totalPeriods - presentPeriods;
      const percentage = totalPeriods === 0 ? 0 : Math.round((presentPeriods / totalPeriods) * 100);

      res.status(200).json({
        records: results,
        username: userResult[0].username,
        summary: {
          present: presentPeriods,
          absent: absentPeriods,
          total: totalPeriods,
          percentage,
        },
      });
    });
  });
});

app.post("/admin-attendance-records", (req, res) => {
  const { session_id } = req.body;

  const sessionQuery = "SELECT faculty_id FROM sessions WHERE session_id = ?";
  db.query(sessionQuery, [session_id], (err, sessionResult) => {
    if (err) return res.status(500).json({ message: "Failed to fetch session details" });
    if (sessionResult.length === 0) return res.status(404).json({ message: "Session not found" });

    const faculty_id = sessionResult[0].faculty_id;

    const attendanceQuery = "SELECT * FROM attendance WHERE session_id = ?";
    db.query(attendanceQuery, [session_id], (err, attendanceResults) => {
      if (err) return res.status(500).json({ message: "Failed to fetch attendance" });
      if (attendanceResults.length === 0) return res.status(404).json({ message: "No attendance records found" });

      const studentIds = attendanceResults.map((record) => record.student_id);
      const userQuery = "SELECT id, username FROM users WHERE id IN (?)";
      db.query(userQuery, [studentIds], (err, userResults) => {
        if (err) return res.status(500).json({ message: "Failed to fetch student names" });

        const studentMap = {};
        userResults.forEach((user) => {
          studentMap[user.id] = user.username;
        });

        const response = attendanceResults.map((attendance) => ({
          student_name: studentMap[attendance.student_id] || "Unknown",
          timestamp: attendance.timestamp,
          faculty_id,
        }));

        res.status(200).json(response);
      });
    });
  });
});

app.post("/signup", (req, res) => {
    const { username, password, role } = req.body;
    const insertQuery = "INSERT INTO users (username, password, role) VALUES (?, ?, ?)";
    db.query(insertQuery, [username, password, role], (err, result) => {
      if (err) return res.status(500).json({ message: "Signup failed" });
      res.status(200).json({ message: "Signup successful" });
    });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
