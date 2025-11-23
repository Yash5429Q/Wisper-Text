import React from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { Box } from "@mui/material";

const CustomPieChart = ({ data, darkMode }) => {
  if (!data || data.length === 0) {
    return <Box sx={{ color: darkMode ? "#aaa" : "#666", textAlign: "center", py: 3 }}>No data available</Box>;
  }

  const COLORS = [
    "#00d4ff",
    "#0066cc",
    "#ff006e",
    "#ff9500",
    "#00ff88",
    "#ff4444",
    "#6600cc",
    "#00ccff",
    "#ffcc00",
    "#00ff00",
    "#ff0066",
    "#00ffcc",
  ];

  const chartData = data.map((item) => ({
    name: item._id || "Unknown",
    value: item.count || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value, percent }) => (
            <tspan
              style={{
                color: darkMode ? "#ccc" : "#000",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              {name}: {value} ({(percent * 100).toFixed(1)}%)
            </tspan>
          )}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: darkMode ? "#1e1e1e" : "#fff",
            border: darkMode ? "1px solid #404040" : "1px solid #ddd",
            borderRadius: "8px",
            color: darkMode ? "#ccc" : "#000",
          }}
          formatter={(value) => [`${value} conversions`, "Count"]}
        />
        <Legend wrapperStyle={{ color: darkMode ? "#ccc" : "#666", fontSize: "0.9rem" }} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CustomPieChart;
