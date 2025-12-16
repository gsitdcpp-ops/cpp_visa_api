const express = require("express");
const app = express();

app.use(express.json());

// Base URL : Homepage Of Website
app.get("/", (req, res) => {
  res.json({
    message: "✅ Server is running!",
    timestamp: new Date().toISOString(),
    success: true,
  });
});

app.get("/myapi", (req, res) => {
  res.json({
    message: "✅ Server is running my api!",
    timestamp: new Date().toISOString(),
    success: true,
  });
});

const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
  console.log(`Local: http://localhost:${PORT}`);
  console.log("Production: https://oneev-kh-api.vercel.app/");
});
