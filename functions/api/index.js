// // api/index.js
// const express = require("express");
// const connectDB = require("../src/util/db");
// const helmet = require("helmet");
// const cors = require("cors");
// const { api_auth } = require("../src/util/api_auth");
// const { jwt_auth } = require("../src/util/jwt_auth");
// const request_user = require("../src/util/request_user");
// const jwt = require("jsonwebtoken");

// // Create Express app
// const app = express();
// app.use(cors());
// app.use(helmet());
// app.use(express.json({ limit: "1kb" }));

// // Connect to MongoDB (only once per function instance)
// connectDB();

// // Root route
// app.get("/", (req, res) => {
//   api_auth(req, res, () => {
//     res.send({ success: true, message: "API Connected" });
//   });
// });

// // Prop object for routes
// const prop = { app, jwt, api_auth, jwt_auth, request_user };

// // Admin routes
// const adminAPI_V1 = require("../src/v1/admin/index.route");
// adminAPI_V1(prop);

// // Export as serverless function
// module.exports = app;
// module.exports.default = (req, res) => app(req, res);

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

app.get("/abc", (req, res) => {
  res.json({
    message: "✅ Server is running!",
    timestamp: new Date().toISOString(),
    success: true,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Local: http://localhost:${PORT}`);
  console.log("Production: https://oneev-kh-api.vercel.app/");
});
