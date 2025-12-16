const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "✅ Server MrBlack is connected! Working as well!",
    timestamp: new Date().toISOString(),
    success: true,
  });
});

const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
  console.log(`Local: http://localhost:${PORT}`);
  console.log("Production: https://cpp-visa-api.vercel.app/");
});
