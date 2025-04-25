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
        // course_code: user.course_code
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
        // course_code: user.course_code
      }
    });
  });
});

app.post("/create-session", async (req, res) => {
  const { facultyId} = req.body;
  // const { facultyId, courseName } = req.body;
  const sessionId = `session-${Date.now()}`;
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  const createdAt = new Date();  // Store session creation time
  const expiryTime = new Date(createdAt.getTime() + 10 * 3000);  // 30 seconds expiry

  try {
    const qrCodeDataUrl = await QRCode.toDataURL(sessionId);

    const query =
      "INSERT INTO sessions (session_id, faculty_id, qr_code_url, otp, created_at, expiry_time) VALUES ( ?, ?, ?, ?, ?, ?)";
    // const query =
    //   "INSERT INTO sessions (session_id, faculty_id, course_name, qr_code_url, otp, created_at, expiry_time) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.query(
      query,
      [sessionId, facultyId,  qrCodeDataUrl, otp, createdAt, expiryTime], // Insert expiry_time as well
      // [sessionId, facultyId, courseName, qrCodeDataUrl, otp, createdAt, expiryTime], // Insert expiry_time as well
      (err, result) => {
        if (err) {
          console.error("Error creating session:", err);
          return res.status(500).json({ message: "Failed to create session" });
        }

        res.status(200).json({
          message: "Session created successfully",
          sessionId,
          qrCode: qrCodeDataUrl,
          otp, // send OTP back to frontend
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
  const timestamp = new Date(); // Current timestamp when marking attendance

  if (!sessionId || !studentId) {
    return res.status(400).json({ message: "Missing session or student ID" });
  }

  // Check if attendance has already been marked
  const checkAttendance = "SELECT * FROM attendance WHERE session_id = ? AND student_id = ?";
  db.query(checkAttendance, [sessionId, studentId], (err, results) => {
    if (results.length > 0) {
      return res.status(400).json({ message: "Attendance already marked" });
    }

    // Check if session exists
    const checkSession = "SELECT * FROM sessions WHERE session_id = ?";
    db.query(checkSession, [sessionId], (err, sessions) => {
      if (sessions.length === 0) return res.status(404).json({ message: "Session not found" });

      const { faculty_id, expiry_time } = sessions[0];
      // const { faculty_id, course_name, expiry_time } = sessions[0];

      // Compare the current timestamp with the session's expiry_time
      const sessionExpiryTime = new Date(expiry_time);

      // If the current time is after the expiry time, return an error
      if (timestamp > sessionExpiryTime) {
        return res.status(400).json({ message: "Session has expired. Attendance cannot be marked" });
      }

      // Insert attendance if session is valid and not expired
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

    const joinQuery = `
      SELECT a.timestamp, s.faculty_id
      FROM attendance a
      JOIN sessions s ON a.session_id = s.session_id
      WHERE a.student_id = ?
      ORDER BY a.timestamp DESC
    `;
    // const joinQuery = `
    //   SELECT a.timestamp, s.faculty_id, s.course_name
    //   FROM attendance a
    //   JOIN sessions s ON a.session_id = s.session_id
    //   WHERE a.student_id = ?
    //   ORDER BY a.timestamp DESC
    // `;

    db.query(joinQuery, [id], (err, results) => {
      if (err) {
        console.error("Error fetching attendance:", err);
        return res.status(500).json({ message: "Attendance fetch failed" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "No attendance records found" });
      }

      res.status(200).json({
        records: results,
        username: userResult[0].username,
      });
    });
  });
});

// In your Express server route
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
