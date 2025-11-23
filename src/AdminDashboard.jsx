import React, { useState, useEffect } from "react";
import { Box, Card, CardContent, Typography, Grid, CircularProgress, Alert, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import PieChart from "./components/PieChart";
import LineChart from "./components/LineChart";

const AdminDashboard = ({ user, darkMode }) => {
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState(null);
  const [conversionStats, setConversionStats] = useState(null);
  const [dailyData, setDailyData] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }

    fetchAnalytics();
  }, [user, navigate]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");


      // Fetch user statistics
      const userRes = await fetch(`${apiUrl}/admin/analytics/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!userRes.ok) throw new Error("Failed to fetch user analytics");
      const userData = await userRes.json();
      setUserStats(userData);

      // Fetch conversion statistics
      const convRes = await fetch(`${apiUrl}/admin/analytics/conversions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!convRes.ok) throw new Error("Failed to fetch conversion analytics");
      const convData = await convRes.json();
      setConversionStats(convData);

      // Fetch daily conversion data
      const dailyRes = await fetch(`${apiUrl}/admin/analytics/conversions/daily`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!dailyRes.ok) throw new Error("Failed to fetch daily data");
      const dailyChartData = await dailyRes.json();
      setDailyData(dailyChartData.dailyConversions);

      // Fetch weekly conversion data
      const weeklyRes = await fetch(`${apiUrl}/admin/analytics/conversions/weekly`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!weeklyRes.ok) throw new Error("Failed to fetch weekly data");
      const weeklyChartData = await weeklyRes.json();
      setWeeklyData(weeklyChartData.weeklyConversions);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">You don't have access to this page</Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={fetchAnalytics} variant="contained" sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  const statCardStyle = {
    background: darkMode
      ? "linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)"
      : "linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)",
    border: darkMode ? "1px solid #404040" : "1px solid #ddd",
    borderRadius: "12px",
    p: 3,
    textAlign: "center",
    boxShadow: darkMode ? "0 4px 15px rgba(0,0,0,0.3)" : "0 4px 15px rgba(0,0,0,0.1)",
  };

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 3 },
        pt: { xs: 18, sm: 16, md: 14 },
        minHeight: "100vh",
        background: darkMode
          ? "linear-gradient(135deg, #0a0e27 0%, #16213e 100%)"
          : "linear-gradient(135deg, #f0f4ff 0%, #e8ecff 100%)",
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            background: "linear-gradient(135deg, #00d4ff 0%, #0066cc 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 700,
            mb: 1,
          }}
        >
          📊 Admin Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: darkMode ? "#aaa" : "#666" }}>
          Welcome back, Admin! Here's your analytics overview.
        </Typography>
      </Box>

      {/* User Statistics Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h6"
          sx={{
            color: darkMode ? "#00d4ff" : "#0066cc",
            fontWeight: 600,
            mb: 2,
            textTransform: "uppercase",
            fontSize: "0.95rem",
            letterSpacing: "1px",
          }}
        >
          👥 User Statistics
        </Typography>

        <Grid container spacing={2}>
          {/* Total Users */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={statCardStyle}>
              <CardContent sx={{ p: 0 }}>
                <Typography sx={{ fontSize: "2.5rem", fontWeight: 700, color: "#00d4ff", mb: 1 }}>
                  {userStats?.totalUsers || 0}
                </Typography>
                <Typography sx={{ color: darkMode ? "#ccc" : "#666", fontSize: "0.95rem" }}>
                  Total Users
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* New Users This Week */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={statCardStyle}>
              <CardContent sx={{ p: 0 }}>
                <Typography sx={{ fontSize: "2.5rem", fontWeight: 700, color: "#00ff88", mb: 1 }}>
                  {userStats?.newUsersThisWeek || 0}
                </Typography>
                <Typography sx={{ color: darkMode ? "#ccc" : "#666", fontSize: "0.95rem" }}>
                  New This Week
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* New Users This Month */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={statCardStyle}>
              <CardContent sx={{ p: 0 }}>
                <Typography sx={{ fontSize: "2.5rem", fontWeight: 700, color: "#ff9500", mb: 1 }}>
                  {userStats?.newUsersThisMonth || 0}
                </Typography>
                <Typography sx={{ color: darkMode ? "#ccc" : "#666", fontSize: "0.95rem" }}>
                  New This Month
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Active Users Today */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={statCardStyle}>
              <CardContent sx={{ p: 0 }}>
                <Typography sx={{ fontSize: "2.5rem", fontWeight: 700, color: "#ff006e", mb: 1 }}>
                  {userStats?.activeUsersToday || 0}
                </Typography>
                <Typography sx={{ color: darkMode ? "#ccc" : "#666", fontSize: "0.95rem" }}>
                  Active Today
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Conversion Statistics Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h6"
          sx={{
            color: darkMode ? "#00d4ff" : "#0066cc",
            fontWeight: 600,
            mb: 2,
            textTransform: "uppercase",
            fontSize: "0.95rem",
            letterSpacing: "1px",
          }}
        >
          🔐 Cipher Conversions
        </Typography>

        <Grid container spacing={2}>
          {/* Total Conversions */}
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={statCardStyle}>
              <CardContent sx={{ p: 0 }}>
                <Typography sx={{ fontSize: "2.5rem", fontWeight: 700, color: "#00d4ff", mb: 1 }}>
                  {conversionStats?.totalConversions || 0}
                </Typography>
                <Typography sx={{ color: darkMode ? "#ccc" : "#666", fontSize: "0.95rem", mb: 1 }}>
                  Total Conversions
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Most Used Cipher */}
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={statCardStyle}>
              <CardContent sx={{ p: 0 }}>
                <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, color: "#00ff88", mb: 0.5 }}>
                  {conversionStats?.mostUsedCipher?.name || "N/A"}
                </Typography>
                <Typography sx={{ color: darkMode ? "#ccc" : "#666", fontSize: "0.95rem", mb: 1 }}>
                  Most Used Cipher
                </Typography>
                <Typography sx={{ color: "#ff9500", fontSize: "0.85rem" }}>
                  Used {conversionStats?.mostUsedCipher?.usageCount || 0} times
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Cipher Breakdown */}
          <Grid item xs={12} sm={12} md={4}>
            <Card sx={statCardStyle}>
              <CardContent sx={{ p: 0 }}>
                <Typography sx={{ fontSize: "1rem", fontWeight: 600, color: "#ff006e", mb: 1.5 }}>
                  Cipher Breakdown
                </Typography>
                <Box sx={{ maxHeight: "200px", overflowY: "auto" }}>
                  {conversionStats?.cipherBreakdown?.slice(0, 8).map((cipher, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.8,
                        pb: 0.8,
                        borderBottom: darkMode ? "1px solid #404040" : "1px solid #ddd",
                        "&:last-child": { borderBottom: "none" },
                      }}
                    >
                      <Typography sx={{ fontSize: "0.85rem", color: darkMode ? "#ccc" : "#666" }}>
                        {cipher._id}
                      </Typography>
                      <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#00ff88" }}>
                        {cipher.count}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Charts Section */}
      <Grid container spacing={2}>
        {/* Daily Conversions Chart */}
        {dailyData && dailyData.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                background: darkMode
                  ? "linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)"
                  : "linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)",
                border: darkMode ? "1px solid #404040" : "1px solid #ddd",
                borderRadius: "12px",
                boxShadow: darkMode ? "0 4px 15px rgba(0,0,0,0.3)" : "0 4px 15px rgba(0,0,0,0.1)",
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    color: darkMode ? "#00d4ff" : "#0066cc",
                    fontWeight: 600,
                    mb: 2,
                  }}
                >
                  📈 Daily Conversions (Last 30 Days)
                </Typography>
                <LineChart data={dailyData} darkMode={darkMode} />
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Weekly Conversions Chart */}
        {weeklyData && weeklyData.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                background: darkMode
                  ? "linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)"
                  : "linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)",
                border: darkMode ? "1px solid #404040" : "1px solid #ddd",
                borderRadius: "12px",
                boxShadow: darkMode ? "0 4px 15px rgba(0,0,0,0.3)" : "0 4px 15px rgba(0,0,0,0.1)",
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    color: darkMode ? "#00d4ff" : "#0066cc",
                    fontWeight: 600,
                    mb: 2,
                  }}
                >
                  📊 Weekly Conversions (Last 12 Weeks)
                </Typography>
                <LineChart data={weeklyData} darkMode={darkMode} />
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Cipher Pie Chart */}
        {conversionStats?.cipherBreakdown && conversionStats.cipherBreakdown.length > 0 && (
          <Grid item xs={12}>
            <Card
              sx={{
                background: darkMode
                  ? "linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)"
                  : "linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)",
                border: darkMode ? "1px solid #404040" : "1px solid #ddd",
                borderRadius: "12px",
                boxShadow: darkMode ? "0 4px 15px rgba(0,0,0,0.3)" : "0 4px 15px rgba(0,0,0,0.1)",
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    color: darkMode ? "#00d4ff" : "#0066cc",
                    fontWeight: 600,
                    mb: 2,
                  }}
                >
                  🎯 Cipher Usage Distribution
                </Typography>
                <PieChart data={conversionStats.cipherBreakdown} darkMode={darkMode} />
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
