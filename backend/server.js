/* eslint-env node */
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import express from "express";
import dotenv from "dotenv";
import mysql from "mysql2";
import cors from "cors";




// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// MySQL connection setup
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "wisphertext_db",
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL database successfully!");
  }
});

// ✅ Route: Test route
app.get("/", (req, res) => {
  res.send("Backend server connected with MySQL successfully!");
});

// Route: Add new user (with encrypted password)
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Encrypt password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    db.query(query, [username, email, hashedPassword], (err) => {
      if (err) {
        console.error("Error inserting user:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.status(201).json({ message: "User registered successfully with encrypted password!" });
    });
  } catch (error) {
    console.error("Encryption error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// Route: User login with JWT
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const query = "SELECT * FROM users WHERE email = ?";
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT Token (expires in 1 hour)
    const token = jwt.sign(
      { id: user.id, email: user.email },
      globalThis.process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful!",
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  });
});



// ✅ Route: Get all users
app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization token missing" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, globalThis.process.env.JWT_SECRET);
    req.userId = decoded.id; // Add user ID to request object
    next();
  } catch (err) {
    console.error("JWT verify error:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// Route: Save encryption/decryption operation to history
app.post("/history", authenticateToken, (req, res) => {
  const { operation, algorithm, input, output, key } = req.body;
  const userId = req.userId;

  const query = `
    INSERT INTO encryption_history 
    (user_id, operation_type, algorithm, input_text, output_text, key_used) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [userId, operation, algorithm, input, output, key],
    (err) => {
      if (err) {
        console.error("Error saving to history:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.status(201).json({ message: "Operation saved to history" });
    }
  );
});

// Route: Get user's encryption/decryption history
app.get("/history", authenticateToken, (req, res) => {
  const userId = req.userId;

  const query = `
    SELECT * FROM encryption_history 
    WHERE user_id = ? 
    ORDER BY created_at DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching history:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Start server
const PORT = globalThis.process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

// Route: Get current user from JWT
app.get("/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization token missing" });
  }

  const token = authHeader.split(" ")[1];
  try {
  const decoded = jwt.verify(token, globalThis.process.env.JWT_SECRET);
    const userId = decoded.id;

    const query = "SELECT id, username, email FROM users WHERE id = ?";
    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error("Database error in /me:", err);
        return res.status(500).json({ error: "Database error" });
      }
      if (!results || results.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      // Return user record (without password)
      return res.json({ user: results[0] });
    });
  } catch (err) {
    console.error("JWT verify error:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
});
