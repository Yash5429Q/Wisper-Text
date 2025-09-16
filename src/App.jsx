import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Box, Typography, Switch, Button } from "@mui/material";
import EncryptPage from "./EncryptPage";
import DecryptPage from "./DecryptPage";
import SmartDecryptPage from "./SmartDecryptPage"; // ✅ new page

function AppContent({ darkMode, setDarkMode }) {
  const location = useLocation(); // ✅ track active route

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          bgcolor: "background.default",
          boxShadow: 1,
          py: 2,
          px: 3,
          textAlign: "center",
          zIndex: 1200,
        }}
      >
        <Typography variant="h4">WhisperText 🔐</Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Encrypt & Decrypt with classic ciphers
        </Typography>

        {/* Dark Mode Toggle */}
        <Box sx={{ position: "absolute", top: 16, right: 40 }}>
          <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
        </Box>

        {/* Navigation Buttons */}
        <Box sx={{ mt: 2 }}>
          <Button
            component={Link}
            to="/"
            variant={location.pathname === "/" ? "contained" : "outlined"}
            sx={{ mx: 1 }}
          >
            Encrypt
          </Button>
          <Button
            component={Link}
            to="/decrypt"
            variant={location.pathname === "/decrypt" ? "contained" : "outlined"}
            sx={{ mx: 1 }}
          >
            Decrypt
          </Button>
          <Button
            component={Link}
            to="/smart-decrypt"
            variant={location.pathname === "/smart-decrypt" ? "contained" : "outlined"}
            sx={{ mx: 1 }}
          >
            Smart Decrypt
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ pt: 16, px: 3 }}>
        <Routes>
          <Route path="/" element={<EncryptPage />} />
          <Route path="/decrypt" element={<DecryptPage />} />
          <Route path="/smart-decrypt" element={<SmartDecryptPage />} />
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
