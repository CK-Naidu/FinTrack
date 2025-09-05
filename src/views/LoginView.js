import React, { useState, useRef } from "react";
import {
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase/config";
import { Wallet, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const OTP_LENGTH = 6;

const LoginView = () => {
  const [showPhoneLogin, setShowPhoneLogin] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const otpRef = useRef([]);

  // Google login
  const handleGoogleAuth = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setSuccess("Signed in successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setError("Google authentication failed.");
      setTimeout(() => setError(""), 3000);
    }
  };

  // Phone number formatting (12345 67890)
  const handlePhoneChange = (e) => {
    let input = e.target.value.replace(/\D/g, "");
    if (input.length > 10) input = input.slice(0, 10);
    if (input.length > 5) {
      input = input.slice(0, 5) + " " + input.slice(5);
    }
    setPhoneNumber(input);
  };

  // Initialize reCAPTCHA
  const initRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        { size: "invisible" }
      );
    }
  };

  // Send OTP
  const handleSendOtp = async () => {
    const cleanPhone = phoneNumber.replace(/\s/g, "");
    if (cleanPhone.length !== 10) {
      setError("Enter a valid 10-digit phone number.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    try {
      setLoading(true);
      initRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const fullPhone = "+91" + cleanPhone;
      const result = await signInWithPhoneNumber(auth, fullPhone, appVerifier);
      setConfirmationResult(result);
      setSuccess("OTP sent successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to send OTP. Try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    const otpString = otp.join("");
    if (!otpString || otpString.length < OTP_LENGTH || !confirmationResult) return;
    try {
      setLoading(true);
      await confirmationResult.confirm(otpString);
      setSuccess("Signed in successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setError("OTP verification failed.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  // OTP input logic
  const handleOtpChange = (e, idx) => {
    let val = e.target.value.replace(/\D/g, "");

    let newOtp = [...otp];

    // Paste support: distribute pasted OTP digits
    if (val.length > 1) {
      val.split("").forEach((digit, i) => {
        if (i + idx < OTP_LENGTH) newOtp[i + idx] = digit;
      });
      setOtp(newOtp);
      const nextIdx = Math.min(idx + val.length, OTP_LENGTH - 1);
      otpRef.current[nextIdx]?.focus();
      return;
    }

    // Single digit input
    newOtp[idx] = val;
    setOtp(newOtp);
    if (val && idx < OTP_LENGTH - 1) {
      otpRef.current[idx + 1].focus();
    }
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === "Backspace") {
      let newOtp = [...otp];
      if (otp[idx]) {
        newOtp[idx] = "";
        setOtp(newOtp);
      } else if (idx > 0) {
        otpRef.current[idx - 1].focus();
        newOtp[idx - 1] = "";
        setOtp(newOtp);
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && idx > 0) {
      otpRef.current[idx - 1].focus();
      e.preventDefault();
    } else if (e.key === "ArrowRight" && idx < OTP_LENGTH - 1) {
      otpRef.current[idx + 1].focus();
      e.preventDefault();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 font-sans">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-2xl">
        {/* Logo + App Name side by side */}
        <div className="flex items-center justify-center space-x-3 mb-2">
          <div className="inline-block p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
            <Wallet className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 tracking-wide">
            FinTrack
          </h1>
        </div>
        <p className="text-center text-gray-600 dark:text-gray-400">
          Sign in to continue your journey.
        </p>

        {/* Success & Error */}
        <AnimatePresence>
          {success && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="text-green-600 font-medium text-center"
            >
              {success}
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="text-red-600 font-medium text-center"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Auth Options */}
        {!showPhoneLogin ? (
          <>
            {/* Google Login */}
            <button
              onClick={handleGoogleAuth}
              className="w-full inline-flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 533.5 544.3">
                <path
                  fill="#4285F4"
                  d="M533.5 278.4c0-17.4-1.6-34.1-4.7-50.4H272v95.4h147.5c-6.4 34.9-25.8 64.5-55.1 84.3l89 69.1c52-47.9 80.1-118.4 80.1-198.4z"
                />
                <path
                  fill="#34A853"
                  d="M272 544.3c73.7 0 135.6-24.4 180.8-66.5l-89-69.1c-24.7 16.6-56.5 26.5-91.8 26.5-70.6 0-130.4-47.6-151.8-111.5l-92.7 71.4c41.1 81.4 125.5 149.2 244.5 149.2z"
                />
                <path
                  fill="#FBBC05"
                  d="M120.2 323.7c-10.7-31.9-10.7-66.4 0-98.3l-92.7-71.4c-39.5 78.9-39.5 162.6 0 241.5l92.7-71.8z"
                />
                <path
                  fill="#EA4335"
                  d="M272 107.7c39.9 0 75.8 13.8 104.1 40.7l77.6-77.6C407.2 24.4 345.3 0 272 0 153 0 68.6 67.8 27.5 149.2l92.7 71.4C141.6 155.3 201.4 107.7 272 107.7z"
                />
              </svg>
              Sign in with Google
            </button>

            {/* Switch to Phone Login */}
            <button
              onClick={() => setShowPhoneLogin(true)}
              className="w-full inline-flex items-center justify-center py-3 px-4 mt-3 border border-gray-300 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition transform hover:scale-105"
            >
              <Phone className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400" />
              Sign in with Phone
            </button>
          </>
        ) : (
          <>
            {/* Phone Input */}
            <div className="flex justify-center items-center space-x-2">
              <span className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 font-medium">
                +91
              </span>
              <input
                type="text"
                placeholder="12345 67890"
                value={phoneNumber}
                onChange={handlePhoneChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-center font-mono text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* OTP Input */}
            {confirmationResult && (
              <div className="flex justify-center space-x-2 mt-3">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => (otpRef.current[i] = el)}
                    type="text"
                    maxLength={1}
                    className="w-10 h-12 border border-gray-300 rounded-md text-center text-lg font-mono focus:ring-2 focus:ring-green-400 focus:outline-none"
                    value={digit}
                    onChange={e => handleOtpChange(e, i)}
                    onKeyDown={e => handleOtpKeyDown(e, i)}
                    onFocus={e => e.target.select()}
                    autoComplete="off"
                    inputMode="numeric"
                  />
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-2 mt-3">
              {!confirmationResult ? (
                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              ) : (
                <button
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.join("").length < OTP_LENGTH}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              )}

              <button
                onClick={() => setShowPhoneLogin(false)}
                className="py-2 px-4 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
              >
                Use Google Instead
              </button>
            </div>
          </>
        )}
      </div>
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default LoginView;
