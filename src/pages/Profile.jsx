import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, User, CheckCircle2, Phone, BookOpen, Camera } from 'lucide-react';
import { FarmContext } from '../context/FarmContext';

const Profile = () => {
  const [profile, setProfile] = useState({
    fullName: '',
    phone: '',
    experience: 'Beginner'
  });

  const [saving, setSaving] = useState(false);
  const { completeProfile, user } = useContext(AuthContext);
  const { farms } = useContext(FarmContext);
  const navigate = useNavigate();

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      completeProfile(); // Mark profile as completed globally
      setSaving(false);
      
      if (farms && farms.length > 0) {
        navigate('/dashboard');
      } else {
        navigate('/add-farm'); 
      }
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      
      {/* Header */}
      <div className="mb-10 text-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-bold text-sm mb-4"
        >
          <User className="w-4 h-4" />
          Onboarding Step 1 of 2
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4"
        >
          Welcome to AgriNova!
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto"
        >
          Let's start by setting up your personal farmer profile.
        </motion.p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Profile Picture Column */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full md:w-1/3"
        >
          <div className="saas-card p-8 flex flex-col items-center text-center">
            <div className="relative group mb-6">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-emerald-400 p-1">
                <div className="w-full h-full bg-white dark:bg-slate-800 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800 overflow-hidden relative">
                  <span className="text-4xl font-bold text-primary">
                    {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : (user?.username?.charAt(0) || 'U')}
                  </span>
                  
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-1">
              {profile.fullName || 'Farmer Name'}
            </h3>
            <p className="text-sm text-slate-500">{user?.email || 'farmer@agrinova.com'}</p>
          </div>
        </motion.div>

        {/* Form Column */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full md:w-2/3"
        >
          <div className="saas-card p-8 sm:p-10">
            <form onSubmit={handleSave} className="space-y-6">
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    required
                    value={profile.fullName}
                    onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                    placeholder="John Doe" 
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="w-5 h-5 text-slate-400" />
                  </div>
                  <input 
                    type="tel" 
                    required
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    placeholder="+91 98765 43210" 
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Farming Experience Level</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <BookOpen className="w-5 h-5 text-slate-400" />
                  </div>
                  <select 
                    required
                    value={profile.experience}
                    onChange={(e) => setProfile({...profile, experience: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white appearance-none cursor-pointer"
                  >
                    <option value="Beginner">Beginner (0-2 years)</option>
                    <option value="Intermediate">Intermediate (3-10 years)</option>
                    <option value="Expert">Expert (10+ years)</option>
                  </select>
                </div>
              </div>

              <div className="pt-6">
                <button 
                  type="submit"
                  disabled={saving || !profile.fullName}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <><Save className="w-5 h-5" /> {farms && farms.length > 0 ? 'Save Profile' : 'Save Profile & Continue'}</>
                  )}
                </button>
              </div>

            </form>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default Profile;
