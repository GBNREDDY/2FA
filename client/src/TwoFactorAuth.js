import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";

export default function TwoFactorAuth() {
  const [qrCode, setQrCode] = useState("");
  const [otp, setOtp] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [recoveryCode, setRecoveryCode] = useState("");
  const [verified, setVerified] = useState(null);

  useEffect(() => {
    axios.post("http://localhost:3030/generate").then((res) => {
      setQrCode(res.data.otpauth_url);
      setRecoveryCodes(res.data.recovery_codes);
    });
  }, []);

  const verifyOtp = async () => {
    const response = await axios.post("http://localhost:3030/verify-otp", { token: otp });
    setVerified(response.data.success);
  };

  const verifyRecoveryCode = async () => {
    const response = await axios.post("http://localhost:3030/verify-recovery", { code: recoveryCode });
    setVerified(response.data.success);
  };

  return (
    <div className="p-4 flex flex-col items-center">
      <h2 className="text-xl font-bold mb-4">Scan QR Code with Google Authenticator</h2>
      {qrCode && <QRCodeCanvas value={qrCode} className="mb-4" />}
      
      <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="border p-2 rounded mb-2" />
      <button onClick={verifyOtp} className="bg-blue-500 text-white px-4 py-2 rounded mb-2">Verify OTP</button>
      
      <h3 className="text-lg font-bold mt-4">Recovery Codes:</h3>
      <ul className="mb-4">
        {recoveryCodes.map((code, index) => (
          <li key={index} className="text-gray-700">{code}</li>
        ))}
      </ul>
      
      <input type="text" placeholder="Enter Recovery Code" value={recoveryCode} onChange={(e) => setRecoveryCode(e.target.value)} className="border p-2 rounded mb-2" />
      <button onClick={verifyRecoveryCode} className="bg-green-500 text-white px-4 py-2 rounded mb-2">Verify Recovery Code</button>
      
      {verified !== null && (
        <p className={verified ? "text-green-500" : "text-red-500"}>
          {verified ? "✅ Verification Successful!" : "❌ Verification Failed"}
        </p>
      )}
    </div>
  );
}