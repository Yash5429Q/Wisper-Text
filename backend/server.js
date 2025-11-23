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
  role: { type: String, enum: ["user", "admin"], default: "user" },
  created_at: { type: Date, default: Date.now },
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
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful!",
      token,
      user: { id: user._id, username: user.username, email: user.email, role: user.role }
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
    req.userRole = decoded.role;
    next();
  } catch (err) {
    console.error("JWT verify error:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// Admin middleware
const authorizeAdmin = (req, res, next) => {
  if (req.userRole !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
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

// ============ ADMIN ROUTES ============

// Route: Get all users (Admin only)
app.get("/admin/users", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const allUsers = await User.find().select("-password");
    res.json({ users: allUsers, total: allUsers.length });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Route: Get user details by ID (Admin only)
app.get("/admin/users/:userId", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Route: Update user role (Admin only)
app.put("/admin/users/:userId/role", authenticateToken, authorizeAdmin, async (req, res) => {
  const { role } = req.body;

  if (!["user", "admin"].includes(role)) {
    return res.status(400).json({ error: "Invalid role. Must be 'user' or 'admin'" });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User role updated successfully", user });
  } catch (err) {
    console.error("Error updating user role:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Route: Delete user (Admin only)
app.delete("/admin/users/:userId", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.userId === req.userId) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete user's history as well
    await History.deleteMany({ user_id: req.params.userId });

    res.json({ message: "User and their history deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Route: Get all user history (Admin only) - for analytics
app.get("/admin/history", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const allHistory = await History.find().sort({ created_at: -1 });
    res.json({ history: allHistory, total: allHistory.length });
  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Route: Get user's history by user ID (Admin only)
app.get("/admin/users/:userId/history", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const userHistory = await History.find({ user_id: req.params.userId }).sort({ created_at: -1 });
    res.json({ history: userHistory, total: userHistory.length });
  } catch (err) {
    console.error("Error fetching user history:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ============ ANALYTICS ROUTES ============

// Route: User Statistics (Admin only)
app.get("/admin/analytics/users", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    
    // New users this week (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsersWeek = await User.countDocuments({ created_at: { $gte: weekAgo } });
    
    // New users this month (last 30 days)
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsersMonth = await User.countDocuments({ created_at: { $gte: monthAgo } });
    
    // Active users today (users who had history entries today)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const activeUsersToday = await History.distinct("user_id", { created_at: { $gte: todayStart } });
    
    res.json({
      totalUsers,
      newUsersThisWeek: newUsersWeek,
      newUsersThisMonth: newUsersMonth,
      activeUsersToday: activeUsersToday.length,
      activeUserIds: activeUsersToday
    });
  } catch (err) {
    console.error("Error fetching user analytics:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Route: Cipher Conversion Statistics (Admin only)
app.get("/admin/analytics/conversions", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const totalConversions = await History.countDocuments();
    
    // Get cipher usage count
    const cipherUsage = await History.aggregate([
      {
        $group: {
          _id: "$algorithm",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Most used cipher
    const mostUsedCipher = cipherUsage[0] || { _id: "N/A", count: 0 };
    
    res.json({
      totalConversions,
      mostUsedCipher: {
        name: mostUsedCipher._id,
        usageCount: mostUsedCipher.count
      },
      cipherBreakdown: cipherUsage
    });
  } catch (err) {
    console.error("Error fetching conversion analytics:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Route: Daily Conversion Chart Data (Admin only)
app.get("/admin/analytics/conversions/daily", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    // Get conversions for the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const dailyData = await History.aggregate([
      {
        $match: { created_at: { $gte: thirtyDaysAgo } }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$created_at" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({ dailyConversions: dailyData });
  } catch (err) {
    console.error("Error fetching daily conversion data:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Route: Weekly Conversion Chart Data (Admin only)
app.get("/admin/analytics/conversions/weekly", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    // Get conversions for the last 12 weeks
    const twelveWeeksAgo = new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000);
    
    const weeklyData = await History.aggregate([
      {
        $match: { created_at: { $gte: twelveWeeksAgo } }
      },
      {
        $group: {
          _id: {
            $week: "$created_at"
          },
          week: { $first: { $dateToString: { format: "%Y-W%V", date: "$created_at" } } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({ weeklyConversions: weeklyData });
  } catch (err) {
    console.error("Error fetching weekly conversion data:", err);
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
    res.json({ user, isAdmin: user.role === "admin" });
  } catch (err) {
    console.error("Database error in /me:", err);
    res.status(500).json({ error: "Database error" });
  }
});
