import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FarmProvider } from './context/FarmContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, LogIn, UserPlus, ChevronRight, Sparkles, BarChart3, CloudSun, Target } from 'lucide-react';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';

import Dashboard from './pages/Dashboard';
import CropRecommendation from './pages/CropRecommendation';
import AddFarm from './pages/AddFarm';
import SelectFarm from './pages/SelectFarm';
import RecommendationHistory from './pages/RecommendationHistory';
import DiseaseDetection from './pages/DiseaseDetection';
import Weather from './pages/Weather';
import MarketIntelligence from './pages/MarketIntelligence';
import MarketIntelligenceHistory from './pages/MarketIntelligenceHistory';

// Only used on Landing Page
const LandingNavigation = () => {
  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-slate-950/40 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary/30 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
            <Leaf className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Agri<span className="text-primary">Nova</span>
          </h1>
        </Link>
        <nav>
          <ul className="flex items-center space-x-2 sm:space-x-4 text-sm font-semibold text-white/90">
            <li>
              <Link to="/login" className="flex items-center gap-2 px-5 py-2.5 rounded-xl hover:bg-white/10 transition-all">
                <LogIn className="w-4 h-4" /> Sign In
              </Link>
            </li>
            <li>
              <Link to="/register" className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300">
                <UserPlus className="w-4 h-4" /> Get Started
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </motion.header>
  );
};

const FeaturePill = ({ icon: Icon, text }) => (
  <motion.div 
    whileHover={{ y: -2, scale: 1.05 }}
    className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sm font-semibold text-white cursor-default shadow-lg"
  >
    <Icon className="w-4 h-4 text-primary" />
    {text}
  </motion.div>
);

const LandingPage = () => {
  return (
    <div className="relative min-h-screen selection:bg-primary/30 selection:text-white">
      {/* Background Image Layer */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2064&auto=format&fit=crop')` }}
      ></div>
      
      {/* Overlay Blur / Darken */}
      <div className="fixed inset-0 z-0 bg-slate-950/70 backdrop-blur-sm"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <LandingNavigation />
        
        <main className="flex-1 flex flex-col items-center justify-center py-20 px-4">
          <div className="text-center max-w-5xl flex flex-col items-center">
            
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-10 font-bold text-sm shadow-sm backdrop-blur-md text-white"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              Next-Generation Agricultural AI
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
              className="text-5xl sm:text-7xl md:text-8xl font-extrabold text-white tracking-tighter leading-[1.1]"
            >
              Farm Smarter, <br />
              <span className="text-primary">Not Harder.</span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="mt-8 text-xl sm:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed font-medium"
            >
              Harness the power of machine learning for pinpoint crop recommendations, predictive yield analysis, and instant disease detection.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
              className="mt-12 flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto"
            >
              <Link to="/register" className="group flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-emerald-500 hover:from-primary-dark hover:to-emerald-600 text-white rounded-2xl shadow-xl shadow-primary/30 font-bold text-lg transition-all transform hover:-translate-y-1 hover:scale-105 active:scale-95">
                Start Free Trial <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl font-bold text-lg transition-all transform hover:-translate-y-1 hover:bg-white/20 active:scale-95">
                See Dashboard Demo
              </Link>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5, type: "spring" }}
              className="mt-20 flex flex-wrap justify-center gap-4"
            >
              <FeaturePill icon={Target} text="92% Precision Accuracy" />
              <FeaturePill icon={CloudSun} text="Hyper-local Weather" />
              <FeaturePill icon={BarChart3} text="Predictive Economics" />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        
        {/* Protected Routes inside MainLayout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/complete-profile" element={<Profile />} />
            <Route path="/add-farm" element={<AddFarm />} />
            <Route path="/select-farm" element={<SelectFarm />} />
            <Route path="/farms" element={<SelectFarm />} />
            <Route path="/crop-recommendation" element={<CropRecommendation />} />
            <Route path="/recommendation-history" element={<RecommendationHistory />} />
            <Route path="/disease-detection" element={<DiseaseDetection />} />
            
            {/* Modules */}
            <Route path="/weather" element={<Weather />} />
            <Route path="/market-intelligence" element={<MarketIntelligence />} />
            <Route path="/market-intelligence/history" element={<MarketIntelligenceHistory />} />
            <Route path="/yield-prediction" element={<Dashboard />} />
            <Route path="/profit-prediction" element={<Dashboard />} />
            <Route path="/pest-prediction" element={<Dashboard />} />
            <Route path="/fertilizers" element={<Dashboard />} />
            <Route path="/irrigation" element={<Dashboard />} />
            <Route path="/analytics" element={<Dashboard />} />
            <Route path="/assistant" element={<Dashboard />} />
            <Route path="/settings" element={<Dashboard />} />
          </Route>
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <FarmProvider>
          <AnimatedRoutes />
        </FarmProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

