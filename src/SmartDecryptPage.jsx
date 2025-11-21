import { useState } from "react";
import FileHandler from "./FileHandler";
import {
  Typography, TextField, Button, Box, List, ListItem, ListItemText, IconButton, Tooltip
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import {
  caesarDecrypt, affineDecrypt, vigenereDecrypt,
  railFenceDecrypt, columnarDecrypt,
  cryptoJSDecrypt, naclDecrypt
} from "./ciphers";

export default function SmartDecryptPage() {
  const [cipherText, setCipherText] = useState("");
  const [key, setKey] = useState("");
  const [results, setResults] = useState([]);

  const handleSmartDecrypt = () => {
    const outputs = [];

    // 🔢 Single number key (Caesar, Rail Fence)
    if (/^\d+$/.test(key)) {
      const numKey = parseInt(key, 10);
      outputs.push({
        algo: "Caesar Cipher",
        text: caesarDecrypt(cipherText, numKey)
      });
      outputs.push({
        algo: "Rail Fence Cipher",
        text: railFenceDecrypt(cipherText, numKey)
      });
    }

    // 🔢 Two numbers (Affine Cipher)
    if (/^\d+,\d+$/.test(key)) {
      const [a, b] = key.split(",").map(Number);
      outputs.push({
        algo: "Affine Cipher",
        text: affineDecrypt(cipherText, a, b)
      });
    }

    // 🔠 Text key (Vigenère, Columnar)
    if (/^[a-zA-Z]+$/.test(key)) {
      outputs.push({
        algo: "Vigenère Cipher",
        text: vigenereDecrypt(cipherText, key)
      });
      outputs.push({
        algo: "Columnar Transposition",
        text: columnarDecrypt(cipherText, key)
      });
    }

    // 🔑 Passphrase (AES, DES, TripleDES, RC4, XSalsa20)
    if (key.length > 3 && !/^\d+$/.test(key)) {
      ["AES", "DES", "TripleDES", "RC4"].forEach((alg) => {
        outputs.push({
          algo: alg,
          text: cryptoJSDecrypt(alg, cipherText, key)
        });
      });

      outputs.push({
        algo: "XSalsa20-Poly1305",
        text: naclDecrypt(cipherText, key)
      });
    }

    setResults(outputs);

    // Save to history (smart decrypt operation)
    const token = localStorage.getItem("token");
    if (token) {
      // Format all outputs with clear separation
      const allOutputs = outputs
        .map((o) => `[${o.algo}]\n${o.text}`)
        .join("\n\n")
        .substring(0, 500); // Store first 500 characters

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      fetch(`${apiUrl}/history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          operation: "decrypt",
          algorithm: "Smart Decrypt (All)",
          input: cipherText.substring(0, 100),
          output: allOutputs || "N/A",
          key: key || null,
        }),
      })
        .then((res) => res.json())
        .catch((err) => console.error("Error saving to history:", err));
    }
  };

  const handleCopyResult = (text) => {
    navigator.clipboard.writeText(text).then(
      () => alert("Copied to clipboard!"),
      (err) => alert("Failed to copy: " + err)
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>🔍 Smart Decrypt</Typography>

      <TextField
        fullWidth multiline rows={4}
        label="Enter Ciphertext"
        value={cipherText}
        onChange={(e) => setCipherText(e.target.value)}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth label="Enter Key (e.g. 3, or 'HELLO', or '5,7')"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Button variant="contained" onClick={handleSmartDecrypt} fullWidth>
        Try All Possible Decryptions
      </Button>

      <Typography variant="h6" sx={{ mt: 3 }}>Results:</Typography>
      {results.length === 0 && <Typography>No results yet</Typography>}

      <List>
        {results.map((r, i) => (
          <ListItem key={i} divider 
            secondaryAction={
              <Tooltip title="Copy result">
                <IconButton 
                  edge="end" 
                  onClick={() => handleCopyResult(r.text)}
                  size="small"
                >
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
            }
          >
            <ListItemText
              primary={r.algo}
              secondary={r.text || "[Decryption Failed or Invalid Key]"}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
