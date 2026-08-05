import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/auth-context';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn, Leaf, Sun, Moon, Globe } from 'lucide-react';

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

// Mock Dashboard Widgets for the background
const BlurredDashboardWidgets = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 flex p-8 gap-8 scale-105 transform origin-center opacity-40 mix-blend-overlay">
      {/* Sidebar Mock */}
      <div className="w-64 h-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl flex flex-col p-6 gap-4">
        <div className="w-32 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg mb-8"></div>
        <div className="w-full h-10 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
        <div className="w-full h-10 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
        <div className="w-full h-10 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
      </div>
      
      {/* Main Content Mock */}
      <div className="flex-1 h-full flex flex-col gap-8">
        {/* Topbar */}
        <div className="w-full h-20 bg-white dark:bg-slate-900 rounded-3xl shadow-xl flex items-center justify-between p-6">
          <div className="w-48 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
          <div className="flex gap-4"><div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800"></div><div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800"></div></div>
        </div>

        {/* Dashboard Grid */}
        <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-8">
          <div className="col-span-2 row-span-1 bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6 flex flex-col gap-4">
            <div className="w-40 h-6 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
            <div className="flex-1 w-full bg-emerald-100 dark:bg-emerald-900/20 rounded-2xl"></div>
          </div>
          <div className="col-span-1 row-span-1 bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6 flex flex-col gap-4">
            <div className="w-32 h-6 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
            <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/20 mx-auto mt-4"></div>
          </div>
          <div className="col-span-1 row-span-1 bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6">
             <div className="w-32 h-6 bg-slate-200 dark:bg-slate-800 rounded-lg mb-4"></div>
             <div className="w-full h-24 bg-rose-100 dark:bg-rose-900/20 rounded-2xl"></div>
          </div>
          <div className="col-span-2 row-span-1 bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6">
             <div className="w-48 h-6 bg-slate-200 dark:bg-slate-800 rounded-lg mb-4"></div>
             <div className="w-full h-24 bg-blue-100 dark:bg-blue-900/20 rounded-2xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useContext(AuthContext);

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(email, password, rememberMe);
    setLoading(false);
    if (!result.success) {
      setError(result.error);
    }
  };


  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      
      {/* Background Layer 1: Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2064&auto=format&fit=crop')` }}
      ></div>
      
      {/* Background Layer 2: Dashboard Mockups */}
      <BlurredDashboardWidgets />

      {/* Background Layer 3: Overlay Blur (Reduced opacity so dashboard is visible!) */}
      <div className="absolute inset-0 z-0 bg-slate-900/40 dark:bg-slate-950/50 backdrop-blur-[12px] transition-colors duration-500"></div>

      {/* Background Layer 4: Particles */}
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

      {/* Login Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/40 dark:border-slate-700/50 p-8 sm:p-10 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">Welcome Back 👋</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Continue managing your farms with AI-powered insights.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-4 text-sm text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-xl font-semibold">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
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

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full pl-12 pr-12 py-3 bg-white/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-slate-900 dark:text-white"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/50" 
                />
                <span className="text-slate-600 dark:text-slate-400 font-medium">Remember me</span>
              </label>
              <Link to="/forgot-password" className="font-bold text-primary hover:text-primary-dark transition-colors">Forgot Password?</Link>

            </div>

            <div className="pt-2">
              <button 
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-primary to-emerald-500 hover:from-primary-dark hover:to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <><LogIn className="w-5 h-5" /> Sign In</>
                )}
              </button>
            </div>
          </form>


          <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400 font-medium">
            Don't have an account? <Link to="/register" className="text-primary hover:text-primary-dark font-bold ml-1 transition-colors">Create Account</Link>
          </p>
          
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
