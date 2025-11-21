import React, { useState } from "react";
import {
  vigenereDecrypt, railFenceDecrypt, columnarDecrypt,
  atbashEncrypt, rot13Encrypt, playfairDecrypt,
  hillDecrypt, autokeyDecrypt, beaufortDecrypt,
  polybiusDecrypt, adfgvxDecrypt, baconDecrypt, xorDecrypt, teaDecrypt,
  cryptoJSDecrypt, blowfishDecrypt, twofishDecrypt, rc5Decrypt, chacha20Decrypt
} from "./ciphers";
import axios from "axios";

const cipherList = [
  "Vigenère", "Rail Fence", "Columnar", "Atbash", "ROT13",
  "Playfair", "Hill", "Autokey", "Beaufort", "Polybius",
  "ADFGVX", "Bacon", "XOR", "TEA",
  "AES", "DES", "TripleDES", "RC4",
  "Blowfish", "Twofish", "RC5", "ChaCha20"
];

const keyExplanations = {
  "Vigenère": "Enter an alphabetic key, e.g. 'KEY'.",
  "Rail Fence": "Enter a numeric key (number of rails), e.g. 3.",
  "Columnar": "Enter a numeric or word key indicating column order, e.g. '3142' or 'WORD'.",
  "Playfair": "Enter an alphabetic keyword, e.g. 'MONARCHY'.",
  "Hill": "Enter numeric key matrix values, e.g. '3 3 2 5'.",
  "Autokey": "Enter alphabetic key to start sequence, e.g. 'QUEEN'.",
  "Beaufort": "Enter alphabetic key, e.g. 'FORT'.",
  "Polybius": "Enter Polybius square key or leave default A–Z grid.",
  "ADFGVX": "Enter 6x6 grid keyword, e.g. 'GERMAN', and transposition key.",
  "Bacon": "No key required.",
  "XOR": "Enter text or numeric passphrase, e.g. '123' or 'key'.",
  "TEA": "Enter 16-character key, e.g. 'ABCDEFGHIJKLMNOP'.",
  "AES": "Enter key (16/24/32 chars depending on AES variant).",
  "DES": "Enter 8-character key for DES.",
  "TripleDES": "Enter 16 or 24-character key.",
  "RC4": "Enter passphrase string, e.g. 'secret'.",
  "Blowfish": "Enter passphrase string, e.g. 'mykey'.",
  "Twofish": "Enter passphrase string, e.g. 'secretkey'.",
  "RC5": "Enter 16-character key for RC5 cipher.",
  "ChaCha20": "Enter 32-character key for ChaCha20 cipher.",
  "Atbash": "No key required.",
  "ROT13": "No key required."
};

export default function DecryptPage({ darkMode }) {
  const [cipherText, setCipherText] = useState("");
  const [key, setKey] = useState("");
  const [cipher, setCipher] = useState("Vigenère");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const handleDecrypt = async () => {
    let result = "";
    try {
      switch (cipher) {
        case "Vigenère": result = vigenereDecrypt(cipherText, key); break;
        case "Rail Fence": result = railFenceDecrypt(cipherText, key); break;
        case "Columnar": result = columnarDecrypt(cipherText, key); break;
        case "Atbash": result = atbashEncrypt(cipherText); break;
        case "ROT13": result = rot13Encrypt(cipherText); break;
        case "Playfair": result = playfairDecrypt(cipherText, key); break;
        case "Hill": result = hillDecrypt(cipherText, key); break;
        case "Autokey": result = autokeyDecrypt(cipherText, key); break;
        case "Beaufort": result = beaufortDecrypt(cipherText, key); break;
        case "Polybius": result = polybiusDecrypt(cipherText, key); break;
        case "ADFGVX": result = adfgvxDecrypt(cipherText, key); break;
        case "Bacon": result = baconDecrypt(cipherText); break;
        case "XOR": result = xorDecrypt(cipherText, key); break;
        case "TEA": result = teaDecrypt(cipherText, key); break;
        case "AES": result = cryptoJSDecrypt("AES", cipherText, key); break;
        case "DES": result = cryptoJSDecrypt("DES", cipherText, key); break;
        case "TripleDES": result = cryptoJSDecrypt("TripleDES", cipherText, key); break;
        case "RC4": result = cryptoJSDecrypt("RC4", cipherText, key); break;
        case "Blowfish": result = blowfishDecrypt(cipherText, key); break;
        case "Twofish": result = twofishDecrypt(cipherText, key); break;
        case "RC5": result = rc5Decrypt(cipherText, key); break;
        case "ChaCha20": result = chacha20Decrypt(cipherText, key); break;
        default: result = cipherText;
      }
      setOutput(result);
      setError("");

      // Save to history
      const token = localStorage.getItem("token");
      if (token) {
        await axios.post(
          "http://localhost:5000/history",
          {
            operation: "decrypt",
            algorithm: cipher,
            input: cipherText,
            output: result,
            key: key || null,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
    } catch (err) {
      setError(err.message);
      console.error("Error in decryption:", err);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setCipherText(event.target.result);
    reader.readAsText(file);
  };

  const handleDownload = () => {
    if (!output.trim()) return alert("Nothing to download!");
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "decrypted_output.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyOutput = () => {
    if (!output.trim()) return alert("Nothing to copy!");
    navigator.clipboard.writeText(output).then(
      () => alert("Copied to clipboard!"),
      (err) => alert("Failed to copy: " + err)
    );
  };

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "0 auto",
        padding: "40px 20px",
        color: darkMode ? "#fff" : "#000",
      }}
    >
      <h2>Decryption</h2>

      {/* Cipher Selector */}
      <div style={{ marginBottom: "25px" }}>
        <label style={{ fontWeight: "bold" }}>Choose Cipher</label>
        <select
          value={cipher}
          onChange={(e) => setCipher(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: darkMode ? "1px solid #444" : "1px solid #ccc",
            fontSize: "16px",
            marginTop: "8px",
            background: darkMode ? "#121212" : "#fff",
            color: darkMode ? "#fff" : "#000",
            appearance: "none",
          }}
        >
          {cipherList.map((c) => (
            <option
              key={c}
              value={c}
              style={{
                background: darkMode ? "#1e1e1e" : "#fff",
                color: darkMode ? "#fff" : "#000",
              }}
            >
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Cipher Text Input */}
      <div style={{ marginBottom: "25px" }}>
        <label style={{ fontWeight: "bold" }}>Cipher Text</label>
        <textarea
          rows={6}
          value={cipherText}
          onChange={(e) => setCipherText(e.target.value)}
          placeholder="Enter or upload cipher text..."
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: darkMode ? "1px solid #444" : "1px solid #ccc",
            fontSize: "16px",
            marginTop: "8px",
            background: darkMode ? "#1e1e1e" : "#f3f3f3",
            color: darkMode ? "#fff" : "#000",
            fontFamily: "monospace",
          }}
        />
        <input type="file" accept=".txt" onChange={handleFileUpload} style={{ marginTop: "10px" }} />
      </div>

      {/* Key Input */}
      <div style={{ marginBottom: "25px" }}>
        <label style={{ fontWeight: "bold" }}>Key</label>
        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder={keyExplanations[cipher] || "Enter key..."}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: darkMode ? "1px solid #444" : "1px solid #ccc",
            fontSize: "16px",
            marginTop: "8px",
            background: darkMode ? "#121212" : "#fff",
            color: darkMode ? "#fff" : "#000",
          }}
        />
      </div>

      {/* Decrypt Button */}
      <button
        onClick={handleDecrypt}
        style={{
          width: "100%",
          backgroundColor: "#1976d2",
          color: "#fff",
          border: "none",
          padding: "16px",
          borderRadius: "8px",
          fontSize: "16px",
          cursor: "pointer",
          fontWeight: "600",
          letterSpacing: "0.5px",
        }}
      >
        DECRYPT
      </button>

      {/* Error Display */}
      {error && (
        <div style={{ 
          marginTop: "20px",
          padding: "12px",
          backgroundColor: "#f44336",
          color: "white",
          borderRadius: "8px",
          marginBottom: "20px"
        }}>
          {error}
        </div>
      )}

      {/* Output */}
      <div style={{ marginTop: "30px" }}>
        <label style={{ fontWeight: "bold" }}>Plain Text</label>
        <textarea
          rows={6}
          value={output}
          readOnly
          placeholder="Decrypted text will appear here..."
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: darkMode ? "1px solid #444" : "1px solid #ccc",
            fontSize: "16px",
            marginTop: "8px",
            background: darkMode ? "#1e1e1e" : "#f3f3f3",
            fontFamily: "monospace",
            resize: "vertical",
            color: darkMode ? "#fff" : "#000",
          }}
        />
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        style={{
          marginTop: "15px",
          width: "100%",
          backgroundColor: "#2e7d32",
          color: "#fff",
          border: "none",
          padding: "14px",
          borderRadius: "8px",
          fontSize: "16px",
          cursor: "pointer",
          fontWeight: "600",
        }}
      >
        Download Output
      </button>

      {/* Copy Button */}
      <button
        onClick={handleCopyOutput}
        style={{
          marginTop: "10px",
          width: "100%",
          backgroundColor: "#ff9800",
          color: "#fff",
          border: "none",
          padding: "14px",
          borderRadius: "8px",
          fontSize: "16px",
          cursor: "pointer",
          fontWeight: "600",
        }}
      >
        📋 Copy Output
      </button>
    </div>
  );
}
