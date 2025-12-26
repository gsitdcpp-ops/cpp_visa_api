const QRCode = require("qrcode");
const { encryptQR, decryptQR } = require("../../util/encryptQR");

const baseRoute = "qrcode-generator/auth/login";

const route = (prop) => {
  const urlAPI = `/${prop.main_route}/${baseRoute}`;

  prop.app.post(
    `${urlAPI}-generator`,
    prop.api_auth,
    prop.jwt_auth,
    prop.request_user,
    async (req, res) => {
      try {
        // Check Param
        const { email } = req.body;

        res.send({ dd: email });

        // const encrypted = encryptQR({
        //   username: "admin01",
        //   password: "Penv!sa@123",
        //   user_type: "ADMIN",
        //   is_expired: false,
        //   exp: Date.now() + 60000,
        // });

        // const qrImage = await QRCode.toDataURL(encrypted);

        // res.json({
        //   success: true,
        //   qr_image: qrImage,
        //   encrypted, // also send raw encrypted string if Flutter wants
        // });
      } catch (err) {
        console.error(err);
        res
          .status(500)
          .json({ success: false, message: "QR generation failed" });
      }
    }
  );

  // 🔹 QR Code receiver/decryptor
  prop.app.post(
    `${urlAPI}-receiver`,
    prop.api_auth,
    prop.jwt_auth,
    prop.request_user,
    async (req, res) => {
      try {
        const { encrypted } = req.body;
        if (!encrypted) {
          return res
            .status(400)
            .json({ success: false, message: "Missing encrypted data" });
        }

        const userData = decryptQR(encrypted);

        // Optional: check expiration
        if (userData.exp && Date.now() > userData.exp) {
          return res
            .status(403)
            .json({ success: false, message: "QR code expired" });
        }

        res.json({
          success: true,
          data: userData,
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Decryption failed" });
      }
    }
  );
};

module.exports = route;
