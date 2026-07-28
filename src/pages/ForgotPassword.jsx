import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Leaf,
  Sun,
  Moon,
  Globe,
  KeyRound,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { forgotPassword, verifyOTP, resetPassword } from '../services/api';

// Animated background particles
const Particles = () => {
  const particles = Array.from({ length: 20 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/20 rounded-full"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            y: [null, Math.random() * -200 - 100],
            opacity: [0.2, 0.8, 0.2]
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};

// Blurred Dashboard Widgets background
const BlurredDashboardWidgets = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 flex p-8 gap-8 scale-105 transform origin-center opacity-40 mix-blend-overlay">
      <div className="w-64 h-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl flex flex-col p-6 gap-4">
        <div className="w-32 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg mb-8"></div>
        <div className="w-full h-10 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
        <div className="w-full h-10 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
      </div>
      <div className="flex-1 h-full flex flex-col gap-8">
        <div className="w-full h-20 bg-white dark:bg-slate-900 rounded-3xl shadow-xl flex items-center justify-between p-6">
          <div className="w-48 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
        </div>
        <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-8">
          <div className="col-span-2 row-span-1 bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6"></div>
          <div className="col-span-1 row-span-1 bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6"></div>
        </div>
      </div>
    </div>
  );
};

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset Password, 4: Success
  const [isDark, setIsDark] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI helpers
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Countdown timer for Resend OTP
  const [timer, setTimer] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const otpInputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Timer countdown effect
  useEffect(() => {
    let interval = null;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  // Live Password Criteria Checks (Keystroke Level)
  const criteria = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const satisfiedCount = Object.values(criteria).filter(Boolean).length;
  const isPasswordValid = satisfiedCount === 5;
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const canSubmitReset = isPasswordValid && passwordsMatch;

  // Strength level calculation
  const getStrengthInfo = () => {
    if (password.length === 0) return { label: '', color: 'bg-slate-200 dark:bg-slate-700', width: '0%' };
    if (satisfiedCount <= 2) return { label: 'Weak', color: 'bg-rose-500', width: '33%' };
    if (satisfiedCount <= 4) return { label: 'Medium', color: 'bg-amber-500', width: '66%' };
    return { label: 'Very Strong', color: 'bg-emerald-500', width: '100%' };
  };

  const strengthInfo = getStrengthInfo();

  // --- Handlers ---

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await forgotPassword(email);
      setLoading(false);
      if (res.success) {
        setStep(2);
        setTimer(60);
        setIsTimerActive(true);
        setSuccessMessage('OTP code has been sent to your email.');
      } else {
        setError(res.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || err.response?.data?.errors?.email?.[0] || 'Email address not found or server error.';
      setError(errMsg);
    }
  };

  // Step 2: Handle OTP input & auto focus
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      otpInputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      otpInputRefs[5].current?.focus();
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (isTimerActive || loading) return;

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await forgotPassword(email);
      setLoading(false);
      if (res.success) {
        setTimer(60);
        setIsTimerActive(true);
        setSuccessMessage('A fresh OTP code has been sent to your email.');
      } else {
        setError(res.message || 'Failed to resend OTP.');
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to resend OTP code.');
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter the complete 6-digit OTP code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await verifyOTP(email, fullOtp);
      setLoading(false);
      if (res.success) {
        setStep(3);
        setError('');
        setSuccessMessage('OTP verified successfully! Create your new password.');
      } else {
        setError(res.message || 'Invalid or expired OTP code.');
      }
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || err.response?.data?.errors?.otp?.[0] || 'Invalid or expired OTP code.';
      setError(errMsg);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!canSubmitReset) return;

    setLoading(true);
    setError('');

    const fullOtp = otp.join('');
    try {
      const res = await resetPassword(email, fullOtp, password, confirmPassword);
      setLoading(false);
      if (res.success) {
        setStep(4);
      } else {
        setError(res.message || 'Failed to reset password.');
      }
    } catch (err) {
      setLoading(false);
      const errors = err.response?.data?.errors;
      let errMsg = err.response?.data?.message || 'Password reset failed.';
      if (errors) {
        if (typeof errors === 'object') {
          const firstKey = Object.keys(errors)[0];
          if (Array.isArray(errors[firstKey])) {
            errMsg = `${firstKey}: ${errors[firstKey].join(', ')}`;
          }
        }
      }
      setError(errMsg);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2064&auto=format&fit=crop')` }}
      ></div>

      {/* Dashboard Mock Backdrop */}
      <BlurredDashboardWidgets />

      {/* Overlay Blur */}
      <div className="absolute inset-0 z-0 bg-slate-900/40 dark:bg-slate-950/50 backdrop-blur-[12px] transition-colors duration-500"></div>

      {/* Particles */}
      <Particles />

      {/* Top Header */}
      <header className="absolute top-0 left-0 right-0 p-6 sm:p-8 flex justify-between items-center z-20">
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
            className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary/30"
          >
            <Leaf className="w-6 h-6" />
          </motion.div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Agri<span className="text-primary">Nova</span>
          </h1>
        </Link>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-semibold transition-colors">
            <Globe className="w-5 h-5" /> <span className="hidden sm:inline">English</span>
          </button>
          <button onClick={toggleTheme} className="p-2 text-white/80 hover:text-amber-400 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all">
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4 my-20"
      >
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/40 dark:border-slate-700/50 p-8 sm:p-10 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]">

          {/* Alert Messages */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 text-sm text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-xl font-semibold flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            {successMessage && !error && step !== 4 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 text-sm text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-xl font-semibold flex items-start gap-3"
              >
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STEP 1: ENTER EMAIL */}
          {step === 1 && (
            <div>
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                  <KeyRound className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                  Forgot Password? 🔐
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Enter your registered email address and we'll send you a 6-digit OTP verification code.
                </p>
              </div>

              <form onSubmit={handleSendOTP} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="farmer@agrinova.com"
                      className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-primary to-emerald-500 hover:from-primary-dark hover:to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:pointer-events-none"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>Send OTP Code</>
                  )}
                </button>

                <div className="text-center pt-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Sign In
                  </Link>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2: VERIFY OTP */}
          {step === 2 && (
            <div>
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                  Verify OTP Code 📲
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  We've sent a 6-digit verification code to <span className="font-semibold text-slate-700 dark:text-slate-200">{email}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 text-center">
                    Enter 6-Digit OTP
                  </label>
                  <div className="flex justify-between gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={otpInputRefs[index]}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-extrabold bg-white/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-slate-900 dark:text-white shadow-sm"
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm px-1">
                  <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                    {isTimerActive ? (
                      `Resend OTP in ${timer}s`
                    ) : (
                      'Didn\'t receive code?'
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isTimerActive || loading}
                    className="inline-flex items-center gap-1.5 font-bold text-xs text-primary hover:text-primary-dark transition-colors disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Resend OTP
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.join('').length !== 6}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-primary to-emerald-500 hover:from-primary-dark hover:to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:pointer-events-none"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>Verify Code</>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setError('');
                    }}
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Change Email Address
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: RESET PASSWORD */}
          {step === 3 && (
            <div>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                  <Lock className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">
                  Reset Password 🔑
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Create a strong new password for your account.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    New Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full pl-10 pr-10 py-2.5 bg-white/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-slate-900 dark:text-white text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full pl-10 pr-10 py-2.5 bg-white/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-slate-900 dark:text-white text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {confirmPassword.length > 0 && (
                    <div className="mt-1 text-xs flex items-center gap-1 font-semibold">
                      {passwordsMatch ? (
                        <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Passwords match</span>
                      ) : (
                        <span className="text-rose-500 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Passwords do not match</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Password Strength Progress Bar */}
                {password.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-500 dark:text-slate-400">Password Strength</span>
                      <span className={`${strengthInfo.color.replace('bg-', 'text-')}`}>
                        {strengthInfo.label}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700/60 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${strengthInfo.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: strengthInfo.width }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}

                {/* Password Requirements Checklist */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/40 space-y-2">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Password Requirements:
                  </p>
                  <ul className="space-y-1.5 text-xs font-medium">
                    <li className={`flex items-center gap-2 ${criteria.length ? 'text-emerald-500 font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
                      {criteria.length ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5" />}
                      At least 8 characters
                    </li>
                    <li className={`flex items-center gap-2 ${criteria.uppercase ? 'text-emerald-500 font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
                      {criteria.uppercase ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5" />}
                      One uppercase letter
                    </li>
                    <li className={`flex items-center gap-2 ${criteria.lowercase ? 'text-emerald-500 font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
                      {criteria.lowercase ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5" />}
                      One lowercase letter
                    </li>
                    <li className={`flex items-center gap-2 ${criteria.number ? 'text-emerald-500 font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
                      {criteria.number ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5" />}
                      One number
                    </li>
                    <li className={`flex items-center gap-2 ${criteria.special ? 'text-emerald-500 font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
                      {criteria.special ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5" />}
                      One special character
                    </li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={loading || !canSubmitReset}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-primary to-emerald-500 hover:from-primary-dark hover:to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>Reset Password</>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 4: SUCCESS SCREEN */}
          {step === 4 && (
            <div className="text-center py-4 space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-500"
              >
                <CheckCircle2 className="w-10 h-10" />
              </motion.div>

              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                  Password Reset Complete! 🎉
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Your password has been successfully updated. You can now log in using your new credentials.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-3.5 bg-gradient-to-r from-primary to-emerald-500 hover:from-primary-dark hover:to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-0.5 active:scale-95"
              >
                Sign In Now
              </button>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
