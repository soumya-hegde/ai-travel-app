import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [msg, setMsg] = useState("");
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(id);
  }, [timer]);

  const sendOtp = async () => {
    try {
      setMsg("");
      await API.post("/forgot-password", { email });
      setStep(2);
      setTimer(60); // 1 minute countdown
      setMsg("OTP sent to your email.");
    } catch (err) {
      setMsg(err.response?.data?.message || err.message);
    }
  };

  const verifyOtp = async () => {
    try {
      setMsg("");
      const res = await API.post("/verifyOtp", { email, otp });
      setResetToken(res.data.resetToken);
      setStep(3);
    } catch (err) {
      setMsg(err.response?.data?.message || err.message);
    }
  };

  const resetPassword = async () => {
    try {
      setMsg("");
      await API.put(
        "/reset-password",
        { newPassword },
        { headers: { Authorization: resetToken } },
      );
      setMsg("Password reset successful. Please login.");
      setTimeout(() => navigate("/login"), 800);
    } catch (err) {
      setMsg(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Forgot Password
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Reset using OTP verification
        </p>

        {step === 1 && (
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              className="w-full rounded-lg border px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              onClick={sendOtp}
              className="w-full rounded-lg bg-blue-600 py-2 text-white font-semibold"
            >
              Send OTP
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Enter OTP"
              className="w-full rounded-lg border px-3 py-2"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button
              onClick={verifyOtp}
              className="w-full rounded-lg bg-blue-600 py-2 text-white font-semibold"
            >
              Verify OTP
            </button>

            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>
                OTP expires in {String(Math.floor(timer / 60)).padStart(2, "0")}
                :{String(timer % 60).padStart(2, "0")}
              </span>
              <button
                type="button"
                onClick={sendOtp}
                disabled={timer > 0}
                className="text-blue-600 underline disabled:text-gray-400"
              >
                Resend OTP
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="New Password"
                className="w-full rounded-lg border px-3 py-2 pr-20"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-700"
              >
                {showPass ? "Hide" : "Show"}
              </button>
            </div>
            <button
              onClick={resetPassword}
              className="w-full rounded-lg bg-blue-600 py-2 text-white font-semibold"
            >
              Reset Password
            </button>
          </div>
        )}

        {msg && (
          <div className="mt-4 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700">
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}
