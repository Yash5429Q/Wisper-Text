import { useState } from "react";
import { TextField, Button, Typography, Box, Paper, Link } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
  const res = await fetch("http://localhost:5000/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username, email, password }),
});


      const data = await res.json();
      if (res.ok) {
        setMessage("Signup successful! Redirecting...");
        setTimeout(() => navigate("/login"), 1000);
      } else {
        setMessage(data.message || "Signup failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setMessage("Error connecting to server");
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <Paper elevation={4} sx={{ p: 4, width: 350, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          Create Account ✨
        </Typography>

        <TextField
          label="Username"
          fullWidth
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          label="Email"
          type="email"
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
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {message}
          </Typography>
        )}

        <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleSignup}>
          Sign Up
        </Button>

        <Typography variant="body2" sx={{ mt: 2 }}>
          Already have an account?{" "}
          <Link href="/login" underline="hover">
            Log in
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
