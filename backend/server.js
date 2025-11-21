/* eslint-env node */
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";




// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch((err) => console.error("❌ MongoDB Connection Error:", err));

const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
});
const User = mongoose.model("User", userSchema);

const historySchema = new mongoose.Schema({
  user_id: String,
  operation_type: String,
  algorithm: String,
  input_text: String,
  output_text: String,
  key_used: String,
  created_at: { type: Date, default: Date.now },
});
const History = mongoose.model("History", historySchema);


// ✅ Route: Test route
app.get("/", (req, res) => {
  res.send("Backend server connected with MongoDB successfully!");
});

// Route: Add new user (with encrypted password)
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully!" });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Email already exists or DB error" });
  }
});
// Route: User login with JWT
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful!",
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});



// ✅ Route: Get all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization token missing" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.error("JWT verify error:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// Route: Save encryption/decryption operation to history
app.post("/history", authenticateToken, async (req, res) => {
  const { operation, algorithm, input, output, key } = req.body;

  try {
    const entry = new History({
      user_id: req.userId,
      operation_type: operation,
      algorithm,
      input_text: input,
      output_text: output,
      key_used: key
    });

    await entry.save();
    res.status(201).json({ message: "History saved!" });

  } catch (err) {
    console.error("History save error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Route: Get user's encryption/decryption history
app.get("/history", authenticateToken, async (req, res) => {
  try {
    const results = await History.find({ user_id: req.userId }).sort({ created_at: -1 });
    res.json(results);
  } catch (err) {
    console.error("History fetch error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Start server
const PORT = globalThis.process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

// Route: Get current user from JWT
app.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user });
  } catch (err) {
    console.error("Database error in /me:", err);
    res.status(500).json({ error: "Database error" });
  }
});
