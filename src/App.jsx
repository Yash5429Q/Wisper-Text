import { useState } from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Snackbar from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Switch from "@mui/material/Switch";
import {
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Paper,
} from "@mui/material";

// --- Cipher Functions ---
function caesarCipher(str, shift) {
  return str.replace(/[a-z]/gi, (c) => {
    let base = c === c.toUpperCase() ? 65 : 97;
    return String.fromCharCode(
      ((c.charCodeAt(0) - base + shift) % 26 + 26) % 26 + base
    );
  });
}

function atbashCipher(str) {
  return str.replace(/[a-z]/gi, (c) => {
    let base = c === c.toUpperCase() ? 65 : 97;
    return String.fromCharCode(base + (25 - (c.charCodeAt(0) - base)));
  });
}

function rot13(str) {
  return caesarCipher(str, 13);
}

function vigenereCipher(str, key, decrypt = false) {
  if (!key) return str;
  key = key.toLowerCase();
  let j = 0;
  return str.replace(/[a-z]/gi, (c) => {
    let base = c === c.toUpperCase() ? 65 : 97;
    let k = key.charCodeAt(j % key.length) - 97;
    if (decrypt) k = -k;
    j++;
    return String.fromCharCode(
      ((c.charCodeAt(0) - base + k + 26) % 26) + base
    );
  });
}

function App() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [cipher, setCipher] = useState("caesar");
  const [shift, setShift] = useState(3);
  const [key, setKey] = useState("");
  const [mode, setMode] = useState("encrypt");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
  });

  // --- Handle Convert ---
  const handleConvert = () => {
    let result = "";
    switch (cipher) {
      case "caesar":
        result =
          mode === "encrypt"
            ? caesarCipher(inputText, shift)
            : caesarCipher(inputText, -shift);
        break;
      case "atbash":
        result = atbashCipher(inputText);
        break;
      case "rot13":
        result = rot13(inputText);
        break;
      case "vigenere":
        result = vigenereCipher(inputText, key, mode === "decrypt");
        break;
      default:
        result = inputText;
    }
    setOutputText(result);
  };

  // --- Handle Copy ---
  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setSnackbarOpen(true);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          width: "100vw",
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.default",
          color: "text.primary",
          p: 3,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            width: "100%",
            mb: 4,
            textAlign: "center",
            position: "relative",
          }}
        >
          <Typography variant="h4">WhisperText 🔐</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Turn secrets into whispers of text.
          </Typography>


          {/* Dark Mode Toggle */}
          <Box sx={{ position: "absolute", top: 0, right: 0 }}>
            <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
          </Box>
        </Box>

        {/* Main 3-Panel Layout */}
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "center",
            alignItems: "stretch",
            gap: 2,
          }}
        >
          {/* Left Panel - Plaintext */}
          <Paper sx={{ flex: 1, p: 2 }} elevation={3}>
            <Typography variant="h6" gutterBottom>
              Plaintext
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={8}
              placeholder="Enter your text here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </Paper>

          {/* Arrow */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ArrowForwardIcon fontSize="large" />
          </Box>

          {/* Middle Panel - Cipher Options */}
          <Paper sx={{ flex: 1, p: 2 }} elevation={3}>
            <Typography variant="h6" gutterBottom>
              Cipher Options
            </Typography>

            {/* Cipher Select */}
            <FormControl fullWidth sx={{ mb: 2 }} variant="outlined">
              <InputLabel id="cipher-label">Choose Cipher</InputLabel>
              <Select
                labelId="cipher-label"
                label="Choose Cipher"
                value={cipher}
                onChange={(e) => setCipher(e.target.value)}
              >
                <MenuItem value="caesar">Caesar Cipher</MenuItem>
                <MenuItem value="atbash">Atbash Cipher</MenuItem>
                <MenuItem value="rot13">ROT13</MenuItem>
                <MenuItem value="vigenere">Vigenère Cipher</MenuItem>
              </Select>
            </FormControl>

            {/* Caesar Shift */}
            {cipher === "caesar" && (
              <TextField
                type="number"
                label="Shift"
                value={shift}
                onChange={(e) => setShift(Number(e.target.value))}
                sx={{ mb: 2 }}
                fullWidth
              />
            )}

            {/* Vigenere Key */}
            {cipher === "vigenere" && (
              <TextField
                type="text"
                label="Key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                sx={{ mb: 2 }}
                fullWidth
              />
            )}

            {/* Mode Selection */}
            <FormControl sx={{ mb: 2 }}>
              <RadioGroup
                row
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                <FormControlLabel
                  value="encrypt"
                  control={<Radio />}
                  label="Encrypt"
                />
                <FormControlLabel
                  value="decrypt"
                  control={<Radio />}
                  label="Decrypt"
                />
              </RadioGroup>
            </FormControl>

            <Button fullWidth variant="contained" onClick={handleConvert}>
              Convert
            </Button>
          </Paper>

          {/* Arrow */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ArrowForwardIcon fontSize="large" />
          </Box>

          {/* Right Panel - Ciphertext */}
          <Paper sx={{ flex: 1, p: 2 }} elevation={3}>
            <Typography variant="h6" gutterBottom>
              Ciphertext
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <TextField
                fullWidth
                multiline
                rows={8}
                placeholder="Result will appear here..."
                value={outputText}
                InputProps={{ readOnly: true }}
              />
              <IconButton color="primary" onClick={handleCopy}>
                <ContentCopyIcon />
              </IconButton>
            </Box>
          </Paper>
        </Box>

        {/* Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={2000}
          message="Copied to clipboard!"
          onClose={() => setSnackbarOpen(false)}
        />
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          mt: 4,
          py: 2,
          textAlign: "center",
          borderTop: "1px solid",
          borderColor: "divider",
          fontSize: "0.9rem",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          <b>WhisperText</b> helps you converts plain text into <b>ciphertext</b> using classic
          methods like Caesar, Atbash, ROT13, and Vigenère. Ciphertext is
          encrypted text that hides the original message, making it useful for
          secure communication.
        </Typography>
      </Box>
    </ThemeProvider>
  );
}

export default App;
