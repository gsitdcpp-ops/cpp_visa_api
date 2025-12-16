const express = require("express");
const connectDB = require("./src/util/db");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const { api_auth } = require("./src/util/api_auth");
const { jwt_auth } = require("./src/util/jwt_auth");
const request_user = require("./src/util/request_user");
const https = require("https");
const mongoose = require("mongoose");

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(express.json({ limit: "1kb" }));
app.use(express.json());

//  ================= Connection =================
connectDB(),
  app.get("/", (req, res) => {
    res.json({
      message: "✅ Server MrBlack is connected! Working as well!",
      timestamp: new Date().toISOString(),
      success: true,
    });
  });

const prop = {
  app: app,
  jwt: jwt,
  api_auth: api_auth,
  jwt_auth: jwt_auth,
  request_user: request_user,
};

const adminAPI_V1 = require("./src/v1/admin/index.route");
adminAPI_V1(prop);

const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
  console.log(`Local: http://localhost:${PORT}`);
  console.log("Production: https://cpp-visa-api.vercel.app/");
});
