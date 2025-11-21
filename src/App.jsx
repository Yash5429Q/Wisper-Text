import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Box, Typography, Switch, Button, Avatar } from "@mui/material";

import EncryptPage from "./EncryptPage";
import DecryptPage from "./DecryptPage";
import SmartDecryptPage from "./SmartDecryptPage";
import HistoryPage from "./HistoryPage";
import LoginPage from "./components/Login";
import SignupPage from "./components/Signup";

function AppContent({ darkMode, setDarkMode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const isLoggedIn = !!user;

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };
  
  // On mount, if token exists, fetch /me to refresh user info
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    fetch(`${apiUrl}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((data) => {
        if (data && data.user) {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      })
      .catch((err) => {
        console.error("/me fetch error:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        // Optionally redirect to login if token expired
        // navigate('/login');
      });
  }, [navigate]);

  // Listen for login events (dispatched from Login component) to refresh user immediately
  useEffect(() => {
    const onLogin = () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      fetch(`${apiUrl}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : Promise.reject(res)))
        .then((data) => {
          if (data && data.user) {
            setUser(data.user);
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        })
        .catch((err) => console.error("/me fetch after login error:", err));
    };

    window.addEventListener("user:login", onLogin);
    return () => window.removeEventListener("user:login", onLogin);
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: darkMode
          ? "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0d1b2a 100%)"
          : "linear-gradient(135deg, #e3f2fd 0%, #f5f7fa 25%, #ffffff 50%, #f0f4ff 75%, #e8eef9 100%)",
        color: "text.primary",
        transition: "background 0.5s ease",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          background: darkMode
            ? "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)"
            : "linear-gradient(135deg, #ffffff 0%, #f5f9ff 50%, #f0f5ff 100%)",
          boxShadow: darkMode
            ? "0 8px 32px rgba(0, 212, 255, 0.2)"
            : "0 8px 32px rgba(0, 102, 204, 0.12)",
          borderBottom: darkMode
            ? "2px solid rgba(0, 212, 255, 0.3)"
            : "2px solid rgba(0, 102, 204, 0.15)",
          py: 1.5,
          px: 3,
          zIndex: 1200,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        {/* Title - Left */}
        <Box sx={{ display: "flex", flexDirection: "column", minWidth: 200 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <span style={{
              fontSize: "2.5rem",
              filter: darkMode
                ? "drop-shadow(0 0 8px rgba(0, 212, 255, 0.6)) drop-shadow(0 0 16px rgba(255, 0, 110, 0.3))"
                : "drop-shadow(0 0 8px rgba(0, 102, 204, 0.4)) drop-shadow(0 0 16px rgba(255, 0, 80, 0.2))",
              animation: "pulse 2s infinite",
            }}>
              🔐
            </span>
            <Typography 
              variant="h4"
              sx={{
                background: darkMode
                  ? "linear-gradient(135deg, #00d4ff 0%, #0099ff 25%, #ff006e 75%, #ff0066 100%)"
                  : "linear-gradient(135deg, #0052cc 0%, #0066ff 25%, #ff0050 75%, #cc003d 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "none",
                fontWeight: 900,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
              }}
            >
              WhisperText
            </Typography>
          </Box>
          <Typography 
            variant="subtitle2" 
            sx={{
              color: darkMode ? "rgba(0, 212, 255, 0.8)" : "rgba(0, 102, 204, 0.75)",
              fontSize: "0.85rem",
              fontWeight: 600,
              letterSpacing: "0.8px",
              textTransform: "uppercase",
            }}
          >
            ⚡ Encrypt & Decrypt ⚡
          </Typography>
        </Box>

        {/* Navigation Buttons - Center */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1, justifyContent: "center" }}>
          <Button
            component={Link}
            to="/"
            variant={location.pathname === "/" ? "contained" : "outlined"}
            size="small"
            sx={{
              background: location.pathname === "/"
                ? darkMode
                  ? "linear-gradient(135deg, #00d4ff 0%, #0066cc 100%)"
                  : "linear-gradient(135deg, #0066cc 0%, #003d99 100%)"
                : "transparent",
            }}
          >
            🔒 Encrypt
          </Button>
          <Button
            component={Link}
            to="/decrypt"
            variant={location.pathname === "/decrypt" ? "contained" : "outlined"}
            size="small"
            sx={{
              background: location.pathname === "/decrypt"
                ? darkMode
                  ? "linear-gradient(135deg, #00d4ff 0%, #0066cc 100%)"
                  : "linear-gradient(135deg, #0066cc 0%, #003d99 100%)"
                : "transparent",
            }}
          >
            🔓 Decrypt
          </Button>
          <Button
            component={Link}
            to="/smart-decrypt"
            variant={
              location.pathname === "/smart-decrypt" ? "contained" : "outlined"
            }
            size="small"
            sx={{
              background: location.pathname === "/smart-decrypt"
                ? darkMode
                  ? "linear-gradient(135deg, #00d4ff 0%, #0066cc 100%)"
                  : "linear-gradient(135deg, #0066cc 0%, #003d99 100%)"
                : "transparent",
            }}
          >
            🤖 Smart Decrypt
          </Button>
          {isLoggedIn && (
            <Button
              component={Link}
              to="/history"
              variant={location.pathname === "/history" ? "contained" : "outlined"}
              size="small"
              sx={{
                background: location.pathname === "/history"
                  ? darkMode
                    ? "linear-gradient(135deg, #00d4ff 0%, #0066cc 100%)"
                    : "linear-gradient(135deg, #0066cc 0%, #003d99 100%)"
                  : "transparent",
              }}
            >
              📜 History
            </Button>
          )}
        </Box>

        {/* Right-side buttons */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            minWidth: 200,
            justifyContent: "flex-end",
            ml: 10,
            pr: 5,
          }}
        >
          {/* Dark mode toggle */}
          <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />

          {/* If logged in show avatar + username + logout, otherwise show login/signup */}
          {isLoggedIn ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  background: darkMode
                    ? "linear-gradient(135deg, #00d4ff 0%, #ff006e 100%)"
                    : "linear-gradient(135deg, #0066cc 0%, #ff0050 100%)",
                  fontSize: 16,
                  fontWeight: 700,
                  boxShadow: darkMode
                    ? "0 4px 15px rgba(0, 212, 255, 0.3)"
                    : "0 4px 15px rgba(0, 102, 204, 0.2)",
                  border: darkMode ? "2px solid rgba(0, 212, 255, 0.3)" : "2px solid rgba(0, 102, 204, 0.2)",
                }}
              >
                {user && user.username ? user.username.charAt(0).toUpperCase() : "U"}
              </Avatar>
              <Typography 
                variant="body2" 
                sx={{ 
                  minWidth: 80, 
                  textAlign: "left",
                  fontWeight: 600,
                  background: darkMode
                    ? "linear-gradient(135deg, #00d4ff 0%, #ff006e 100%)"
                    : "linear-gradient(135deg, #0066cc 0%, #ff0050 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {user && user.username ? user.username : "User"}
              </Typography>
              <Button
                onClick={handleLogout}
                variant="outlined"
                color="error"
                size="small"
                sx={{
                  borderColor: darkMode ? "#ff4444" : "#ff0050",
                  color: darkMode ? "#ff4444" : "#ff0050",
                  "&:hover": {
                    backgroundColor: darkMode
                      ? "rgba(255, 68, 68, 0.1)"
                      : "rgba(255, 0, 80, 0.05)",
                  },
                }}
              >
                Logout
              </Button>
            </Box>
          ) : (
            <>
              <Button
                component={Link}
                to="/login"
                variant="outlined"
                size="small"
                sx={{
                  borderColor: darkMode ? "#00d4ff" : "#0066cc",
                  color: darkMode ? "#00d4ff" : "#0066cc",
                }}
              >
                Login
              </Button>
              <Button
                component={Link}
                to="/signup"
                variant="contained"
                size="small"
                sx={{
                  background: darkMode
                    ? "linear-gradient(135deg, #ff006e 0%, #ff0050 100%)"
                    : "linear-gradient(135deg, #ff0050 0%, #cc003d 100%)",
                  boxShadow: darkMode
                    ? "0 4px 15px rgba(255, 0, 110, 0.3)"
                    : "0 4px 15px rgba(255, 0, 80, 0.2)",
                }}
              >
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Navigation Bar - REMOVED (now in header) */}

      {/* Main Content */}
      <Box sx={{ pt: 10, px: 3 }}>
        <Routes>
          <Route
            path="/"
            element={<EncryptPage darkMode={darkMode} setDarkMode={setDarkMode} />}
          />
          <Route
            path="/decrypt"
            element={<DecryptPage darkMode={darkMode} setDarkMode={setDarkMode} />}
          />
          <Route
            path="/smart-decrypt"
            element={<SmartDecryptPage darkMode={darkMode} setDarkMode={setDarkMode} />}
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/history"
            element={
              isLoggedIn ? (
                <HistoryPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </Box>
    </Box>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: darkMode ? "#00d4ff" : "#0066cc", // Cybersecurity cyan/blue
      },
      secondary: {
        main: darkMode ? "#ff006e" : "#ff0050", // Cybersecurity pink/red
      },
      background: {
        default: darkMode ? "#0a0e27" : "#f5f7fa", // Dark navy / Light blue-gray
        paper: darkMode ? "#1a1f3a" : "#ffffff", // Darker navy / White
      },
      success: {
        main: "#00ff41", // Matrix green
      },
      warning: {
        main: "#ffb700", // Bright orange
      },
      error: {
        main: "#ff4444", // Bright red
      },
      info: {
        main: "#00d4ff", // Cyan
      },
      text: {
        primary: darkMode ? "#e0e0e0" : "#1a1a1a",
        secondary: darkMode ? "#a0a0a0" : "#666666",
      },
    },
    typography: {
      fontFamily: "'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
      h1: {
        fontWeight: 700,
        fontSize: "2.5rem",
        letterSpacing: "0.5px",
      },
      h4: {
        fontWeight: 600,
        fontSize: "2rem",
        letterSpacing: "1px",
      },
      button: {
        textTransform: "uppercase",
        fontWeight: 600,
        letterSpacing: "0.5px",
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          contained: {
            background: darkMode 
              ? "linear-gradient(135deg, #00d4ff 0%, #0066cc 100%)" 
              : "linear-gradient(135deg, #0066cc 0%, #003d99 100%)",
            color: "#fff",
            boxShadow: "0 4px 15px rgba(0, 212, 255, 0.3)",
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: "0 8px 25px rgba(0, 212, 255, 0.5)",
              transform: "translateY(-2px)",
            },
          },
          outlined: {
            borderColor: darkMode ? "#00d4ff" : "#0066cc",
            color: darkMode ? "#00d4ff" : "#0066cc",
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: darkMode 
                ? "rgba(0, 212, 255, 0.1)" 
                : "rgba(0, 102, 204, 0.05)",
              borderColor: darkMode ? "#ff006e" : "#ff0050",
              color: darkMode ? "#ff006e" : "#ff0050",
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              transition: "all 0.3s ease",
              "&:hover fieldset": {
                borderColor: darkMode ? "#00d4ff" : "#0066cc",
              },
              "&.Mui-focused fieldset": {
                borderColor: darkMode ? "#00d4ff" : "#0066cc",
                boxShadow: `0 0 10px ${darkMode ? "rgba(0, 212, 255, 0.3)" : "rgba(0, 102, 204, 0.2)"}`,
              },
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: darkMode
              ? "linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(255, 0, 110, 0.05) 100%)"
              : "linear-gradient(135deg, rgba(0, 102, 204, 0.02) 0%, rgba(255, 0, 80, 0.02) 100%)",
            borderRadius: "12px",
            border: darkMode
              ? "1px solid rgba(0, 212, 255, 0.1)"
              : "1px solid rgba(0, 102, 204, 0.1)",
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: darkMode
                ? "0 8px 24px rgba(0, 212, 255, 0.15)"
                : "0 8px 24px rgba(0, 102, 204, 0.1)",
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: darkMode
              ? "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)"
              : "linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)",
            borderBottom: darkMode
              ? "2px solid rgba(0, 212, 255, 0.2)"
              : "2px solid rgba(0, 102, 204, 0.1)",
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AppContent darkMode={darkMode} setDarkMode={setDarkMode} />
      </Router>
    </ThemeProvider>
  );
}

export default App;
