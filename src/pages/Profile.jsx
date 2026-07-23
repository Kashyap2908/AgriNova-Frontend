import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FarmContext } from '../context/FarmContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, User, Phone, Globe, Camera, CheckCircle2, ArrowRight, ShieldCheck, Trash2 } from 'lucide-react';
import { updateUserProfile } from '../services/api';

const Profile = () => {
  const { user, completeProfile, updateProfile } = useContext(AuthContext);
  const { farms } = useContext(FarmContext);
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.fullName || user?.username || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [language, setLanguage] = useState(user?.language || 'English');
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [previewUrl, setPreviewUrl] = useState(user?.avatar || null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.fullName) setFullName(user.fullName);
      if (user.phone) setPhone(user.phone);
      if (user.language) setLanguage(user.language);
      if (user.avatar) {
        setAvatar(user.avatar);
        setPreviewUrl(user.avatar);
      }
    }
  }, [user]);

  // Handle Photo Select / Preview
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setAvatar(url);
    }
  };

  const handleRemovePhoto = () => {
    setPreviewUrl(null);
    setAvatar(null);
  };

  // Calculate Profile Completion Percentage
  const getCompletionPercentage = () => {
    let count = 0;
    if (fullName.trim()) count += 40;
    if (phone.trim()) count += 30;
    if (language) count += 15;
    if (previewUrl) count += 15;
    return count;
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);

    const profileData = {
      fullName,
      phone,
      language,
      avatar: previewUrl
    };

    // Try sending update to API backend asynchronously
    await updateUserProfile(profileData);

    setTimeout(() => {
      completeProfile(profileData);
      setSaving(false);

      if (farms && farms.length > 0) {
        navigate('/select-farm');
      } else {
        navigate('/add-farm');
      }
    }, 600);
  };

  const handleSkipPhoto = () => {
    handleRemovePhoto();
  };

  const completionPct = getCompletionPercentage();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Page Header */}
      <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-6">
        <div>
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-bold text-xs mb-3"
          >
            <User className="w-3.5 h-3.5 text-primary" />
            {user?.profileCompleted ? 'Edit Profile' : 'Onboarding Step 1 of 2'}
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight"
          >
            Farmer Personal Profile
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 dark:text-slate-400 mt-1 text-sm sm:text-base max-w-xl"
          >
            Manage your account credentials, contact information, and preferred system language.
          </motion.p>
        </div>

        {/* Profile Progress Indicator Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="saas-card p-5 w-full sm:w-64 bg-gradient-to-br from-white to-emerald-50/50 dark:from-slate-800 dark:to-slate-800/80 border border-emerald-100 dark:border-slate-700 shadow-sm"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">Profile Progress</span>
            <span className="text-sm font-extrabold text-primary">{completionPct}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden mb-2">
            <motion.div 
              className="bg-primary h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completionPct}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {completionPct === 100 ? 'All details completed!' : 'Fill in details to unlock full features'}
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Profile Photo Column */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-4"
        >
          <div className="saas-card p-6 text-center flex flex-col items-center">
            <div className="relative group mb-4">
              <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-primary to-emerald-400 p-1 shadow-lg shadow-primary/20">
                <div className="w-full h-full bg-white dark:bg-slate-900 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800 overflow-hidden relative">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Profile Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-extrabold text-primary">
                      {fullName ? fullName.charAt(0).toUpperCase() : (user?.username?.charAt(0).toUpperCase() || 'F')}
                    </span>
                  )}
                  
                  <label htmlFor="photo-upload" className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-bold gap-1">
                    <Camera className="w-6 h-6" />
                    <span>Upload Photo</span>
                  </label>
                </div>
              </div>
              <input 
                id="photo-upload" 
                type="file" 
                accept="image/*" 
                onChange={handlePhotoUpload} 
                className="hidden" 
              />
            </div>

            <h3 className="font-extrabold text-lg text-slate-800 dark:text-white mb-0.5">
              {fullName || user?.username || 'Farmer Profile'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{user?.email || 'farmer@agrinova.com'}</p>

            <div className="flex flex-wrap gap-2 justify-center w-full">
              <label htmlFor="photo-upload" className="flex-1 py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-primary" /> {previewUrl ? 'Change Photo' : 'Upload Photo'}
              </label>
              {previewUrl && (
                <button 
                  type="button" 
                  onClick={handleRemovePhoto} 
                  className="py-2 px-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              )}
            </div>

            {!previewUrl && (
              <button 
                type="button" 
                onClick={handleSkipPhoto} 
                className="mt-3 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-semibold underline"
              >
                Skip Photo Setup
              </button>
            )}
          </div>

          {/* Privacy Note */}
          <div className="mt-4 p-4 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Your profile information is securely encrypted and strictly used for personalized farming advisory services.
            </p>
          </div>
        </motion.div>

        {/* Form Column */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="md:col-span-8"
        >
          <div className="saas-card p-6 sm:p-8">
            <form onSubmit={handleSave} className="space-y-6">
              
              {/* Full Name */}
              <div>
                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Chandra Patil" 
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="w-5 h-5 text-slate-400" />
                  </div>
                  <input 
                    type="tel" 
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210" 
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              {/* Preferred Language */}
              <div>
                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Preferred Language <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Globe className="w-5 h-5 text-slate-400" />
                  </div>
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white font-medium cursor-pointer"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="Marathi">Marathi (मराठी)</option>
                    <option value="Gujarati">Gujarati (ગુજરાતી)</option>
                    <option value="Punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
                    <option value="Telugu">Telugu (తెలుగు)</option>
                    <option value="Tamil">Tamil (தமிழ்)</option>
                    <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                    <option value="Bengali">Bengali (বাংলা)</option>
                  </select>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                  Language for SMS alerts, AI recommendations, and system notifications.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-end">
                <button 
                  type="submit"
                  disabled={saving || !fullName.trim() || !phone.trim()}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Save className="w-5 h-5" /> 
                      {user?.profileCompleted ? 'Save Changes' : 'Save & Continue'}
                      {!user?.profileCompleted && <ArrowRight className="w-4 h-4 ml-1" />}
                    </>
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
