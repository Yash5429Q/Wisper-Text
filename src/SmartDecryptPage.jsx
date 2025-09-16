import { useState } from "react";
import FileHandler from "./FileHandler";
import {
  Typography, TextField, Button, Box, List, ListItem, ListItemText
} from "@mui/material";

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
          <ListItem key={i} divider>
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
