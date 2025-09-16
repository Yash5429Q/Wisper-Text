import React, { useState } from "react";
import { Button, Box } from "@mui/material";

export default function FileHandler({ input, setInput, output }) {
  const [fileName, setFileName] = useState("result.txt");

  // Handle File Upload → fills input
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFileName(file.name.replace(/\.[^/.]+$/, "") + "_result.txt");

    const reader = new FileReader();
    reader.onload = (e) => {
      setInput(e.target.result); // put file content into input text area
    };
    reader.readAsText(file);
  };

  // Handle File Download → saves output instead of input
  const handleFileDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  };

  return (
    <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
      {/* Upload File */}
      <Button variant="outlined" component="label">
        Upload File
        <input
          type="file"
          accept=".txt"
          hidden
          onChange={handleFileUpload}
        />
      </Button>

      {/* Download File */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleFileDownload}
        disabled={!output}
      >
        Download Result
      </Button>
    </Box>
  );
}
