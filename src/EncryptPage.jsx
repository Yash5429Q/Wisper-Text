import { useState } from "react";
import FileHandler from "./FileHandler";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  Typography, TextField, Button, Select, MenuItem, FormControl,
  InputLabel, Box, IconButton, Snackbar
} from "@mui/material";

import {
  caesarEncrypt, affineEncrypt, vigenereEncrypt,
  railFenceEncrypt, columnarEncrypt,
  cryptoJSEncrypt, naclEncrypt
} from "./ciphers";

export default function EncryptPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [cipher, setCipher] = useState("caesar");
  const [key, setKey] = useState("");
  const [extraKey, setExtraKey] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleConvert = () => {
    let result = "";
    switch (cipher) {
      case "caesar": result = caesarEncrypt(input, key || 3); break;
      case "affine": result = affineEncrypt(input, key || 5, extraKey || 8); break;
      case "vigenere": result = vigenereEncrypt(input, key || "KEY"); break;
      case "railfence": result = railFenceEncrypt(input, key || 3); break;
      case "columnar": result = columnarEncrypt(input, key || "3142"); break;
      case "aes": result = cryptoJSEncrypt("AES", input, key || "pass"); break;
      case "des": result = cryptoJSEncrypt("DES", input, key || "pass"); break;
      case "tripledes": result = cryptoJSEncrypt("TripleDES", input, key || "pass"); break;
      case "rc4": result = cryptoJSEncrypt("RC4", input, key || "pass"); break;
      case "xsalsa": result = naclEncrypt(input, key || "pass"); break;
      default: result = input;
    }
    setOutput(result);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setSnackbarOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Encrypt Text</Typography>

      <TextField
        fullWidth multiline rows={4}
        label="Enter Plaintext"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        sx={{ mb: 2 }}
      />

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="cipher-select-label">Choose Cipher</InputLabel>
        <Select
          labelId="cipher-select-label"
          id="cipher-select"
          value={cipher}
          label="Choose Cipher"
          onChange={(e) => setCipher(e.target.value)}
        >
          <MenuItem value="caesar">Caesar</MenuItem>
          <MenuItem value="affine">Affine</MenuItem>
          <MenuItem value="vigenere">Vigenère</MenuItem>
          <MenuItem value="railfence">Rail Fence</MenuItem>
          <MenuItem value="columnar">Columnar</MenuItem>
          <MenuItem value="aes">AES</MenuItem>
          <MenuItem value="des">DES</MenuItem>
          <MenuItem value="tripledes">Triple DES</MenuItem>
          <MenuItem value="rc4">RC4</MenuItem>
          <MenuItem value="xsalsa">XSalsa20-Poly1305</MenuItem>
        </Select>
      </FormControl>
      <FileHandler input={input} setInput={setInput} output={output} />

      {(cipher === "caesar" || cipher === "railfence") && (
        <TextField
          type="number" label="Key (number)"
          value={key} onChange={(e) => setKey(e.target.value)}
          fullWidth sx={{ mb: 2 }}
        />
      )}

      {cipher === "affine" && (
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField type="number" label="a" value={key}
            onChange={(e) => setKey(e.target.value)} fullWidth />
          <TextField type="number" label="b" value={extraKey}
            onChange={(e) => setExtraKey(e.target.value)} fullWidth />
        </Box>
      )}

      {cipher === "vigenere" && (
        <TextField type="text" label="Key (text)"
          value={key} onChange={(e) => setKey(e.target.value)}
          fullWidth sx={{ mb: 2 }}
        />
      )}

      {(cipher === "aes" || cipher === "des" || cipher === "tripledes" || cipher === "rc4" || cipher === "xsalsa") && (
        <TextField type="text" label="Passphrase"
          value={key} onChange={(e) => setKey(e.target.value)}
          fullWidth sx={{ mb: 2 }}
        />
      )}

      <Button variant="contained" onClick={handleConvert} fullWidth>Encrypt</Button>

      <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
        <TextField fullWidth multiline rows={4} label="Ciphertext" value={output} InputProps={{ readOnly: true }} />
        <IconButton color="primary" onClick={handleCopy}><ContentCopyIcon /></IconButton>
      </Box>

      <Snackbar open={snackbarOpen} autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)} message="Copied!" />
    </Box>
  );
}
