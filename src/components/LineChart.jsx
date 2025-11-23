import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Box } from "@mui/material";

const CustomLineChart = ({ data, darkMode }) => {
  if (!data || data.length === 0) {
    return <Box sx={{ color: darkMode ? "#aaa" : "#666", textAlign: "center", py: 3 }}>No data available</Box>;
  }

  // Format data for Recharts
  const chartData = data.map((item) => ({
    date: item._id || item.week || "N/A",
    conversions: item.count || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={darkMode ? "#404040" : "#ddd"}
        />
        <XAxis
          dataKey="date"
          stroke={darkMode ? "#888" : "#666"}
          style={{ fontSize: "0.85rem" }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis
          stroke={darkMode ? "#888" : "#666"}
          style={{ fontSize: "0.85rem" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: darkMode ? "#1e1e1e" : "#fff",
            border: darkMode ? "1px solid #404040" : "1px solid #ddd",
            borderRadius: "8px",
            color: darkMode ? "#ccc" : "#000",
          }}
          formatter={(value) => [value, "Conversions"]}
        />
        <Legend wrapperStyle={{ color: darkMode ? "#ccc" : "#666" }} />
        <Line
          type="monotone"
          dataKey="conversions"
          stroke="#00d4ff"
          strokeWidth={2}
          dot={{ fill: "#0066cc", r: 4 }}
          activeDot={{ r: 6 }}
          name="Conversions"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default CustomLineChart;
