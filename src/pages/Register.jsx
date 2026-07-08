import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, UserPlus, Leaf, Sun, Moon, Globe } from 'lucide-react';

// Animated background particles (reused from Login)
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

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

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

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await register(name, email, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error);
    }
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      register('Google Farmer', 'google-sso');
      setLoading(false);
    }, 1500);
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

      {/* Register Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4 mt-16 sm:mt-0"
      >
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/40 dark:border-slate-700/50 p-8 sm:p-10 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">Join AgriNova 🌱</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Create your account to unlock AI-powered farming insights.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            {error && (
              <div className="p-4 text-sm text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-xl font-semibold">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe" 
                  className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-slate-900 dark:text-white"
                />
              </div>
            </div>

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

            <div className="pt-2">
              <button 
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-primary to-emerald-500 hover:from-primary-dark hover:to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <><UserPlus className="w-5 h-5" /> Create Account</>
                )}
              </button>
            </div>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px bg-slate-200 dark:bg-slate-700/50 flex-1"></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">OR</span>
            <div className="h-px bg-slate-200 dark:bg-slate-700/50 flex-1"></div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700 font-bold rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400 font-medium">
            Already have an account? <Link to="/login" className="text-primary hover:text-primary-dark font-bold ml-1 transition-colors">Sign In</Link>
          </p>
          
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
