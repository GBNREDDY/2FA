const express = require("express");
const fs = require("fs");
const speakeasy = require("speakeasy");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors()); // Enable CORS

const SECRET_FILE = "totp_secret.json";
const RECOVERY_FILE = "recovery_codes.json";

// Generate TOTP Secret & Recovery Codes
app.post("/generate", (req, res) => {
    const secret = speakeasy.generateSecret({ length: 20 });
    const recoveryCodes = Array.from({ length: 5 }, () => crypto.randomBytes(4).toString("hex"));

    fs.writeFileSync(SECRET_FILE, JSON.stringify({ secret: secret.base32 }, null, 2));
    fs.writeFileSync(RECOVERY_FILE, JSON.stringify(recoveryCodes, null, 2));

    res.json({
        message: "TOTP Secret & Recovery Codes Generated",
        secret: secret.base32,
        otpauth_url: secret.otpauth_url,
        recovery_codes: recoveryCodes,
    });
});

// Verify TOTP Code
app.post("/verify-otp", (req, res) => {
    const { token } = req.body;
    const secretData = JSON.parse(fs.readFileSync(SECRET_FILE));

    const verified = speakeasy.totp.verify({
        secret: secretData.secret,
        encoding: "base32",
        token,
        window: 1,
    });

    res.json({ success: verified });
});

// Verify Recovery Code
app.post("/verify-recovery", (req, res) => {
    const { code } = req.body;
    let recoveryCodes = JSON.parse(fs.readFileSync(RECOVERY_FILE));

    if (recoveryCodes.includes(code)) {
        recoveryCodes = recoveryCodes.filter(c => c !== code);
        fs.writeFileSync(RECOVERY_FILE, JSON.stringify(recoveryCodes, null, 2));
        return res.json({ success: true, message: "Recovery code used successfully" });
    }

    res.json({ success: false, message: "Invalid recovery code" });
});

app.listen(3030, () => console.log("Server running on port 3030"));
