import { useState } from "react";
import { TextField, Button, Typography, Box, Paper, Link } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("Login response:", data); // Debugging log

      if (res.ok) {
        localStorage.setItem("token", data.token);
        // Save user info so App can detect logged-in state
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        setMessage("✅ Login successful! Redirecting...");
        // Inform the app that a user has logged in so header updates immediately
        window.dispatchEvent(new Event("user:login"));
        // App's Encrypt page is mounted at the root path '/'
        setTimeout(() => navigate("/"), 800);
      } else {
        setMessage(data.error || "❌ Invalid email or password");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("⚠️ Error connecting to server");
    }
  };

  return (
    <Box  
      sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}
    >
      <Paper elevation={4} sx={{ p: 4, width: 350, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          Login to WhisperText 🔐
        </Typography>

        <TextField
          label="Email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {message && (
          <Typography
            variant="body2"
            color={message.includes("✅") ? "success.main" : "error.main"}
            sx={{ mt: 2 }}
          >
            {message}
          </Typography>
        )}

        <Button variant="contained" fullWidth sx={{ mt: 3 }} onClick={handleLogin}>
          LOGIN
        </Button>

        <Typography variant="body2" sx={{ mt: 2 }}>
          Don’t have an account?{" "}
          <Link href="/signup" underline="hover">
            Sign up
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
