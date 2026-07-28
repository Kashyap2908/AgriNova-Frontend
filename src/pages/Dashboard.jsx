import React, { useContext } from 'react';
import { AuthContext } from '../context/auth-context';
import { FarmContext } from '../context/farm-context';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  User, Phone, Globe, MapPin, Scale, Layers, Droplets, PlusSquare, 
  Map, CheckCircle2, ArrowRight, ShieldCheck, Sprout, Settings, Compass
} from 'lucide-react';

const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
  <motion.div 
    whileHover={{ y: -3 }} 
    className="saas-card p-6 flex flex-col justify-between"
  >
    <div className="flex justify-between items-start mb-3">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
    <div>
      <h4 className="text-slate-500 dark:text-slate-400 text-xs font-extrabold uppercase tracking-wider mb-1">{title}</h4>
      <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">{value}</h3>
      {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { farms, selectedFarm } = useContext(FarmContext);

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  const totalAcres = farms.reduce((sum, f) => sum + (parseFloat(f.area) || 0), 0);

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto px-4 sm:px-6">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight"
          >
            Welcome, {user?.fullName || user?.username || 'Farmer'} 👋
          </motion.h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm flex items-center gap-2">
            <span>{today}</span> • <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Post-Login Setup Complete</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            to="/select-farm" 
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-sm transition-all"
          >
            <Map className="w-4 h-4" /> Manage / Switch Farm
          </Link>
          <Link 
            to="/add-farm" 
            className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/20 text-sm transition-all"
          >
            <PlusSquare className="w-4 h-4" /> Add Farm
          </Link>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard 
          title="Total Farms Registered" 
          value={`${farms.length} Farm${farms.length === 1 ? '' : 's'}`} 
          subtitle="Configured in FarmContext"
          icon={Map} 
          color="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400" 
        />
        <StatCard 
          title="Active Farm Selected" 
          value={selectedFarm ? selectedFarm.name : 'None Selected'} 
          subtitle={selectedFarm?.location || 'Select active farm'}
          icon={CheckCircle2} 
          color="bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400" 
        />
        <StatCard 
          title="Total Land Managed" 
          value={`${totalAcres.toFixed(1)} ${selectedFarm?.areaUnit || 'Acres'}`} 
          subtitle={`Across ${farms.length} distinct locations`}
          icon={Scale} 
          color="bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400" 
        />
      </div>

      {/* Main Content Grid: Farmer Profile Summary & Active Selected Farm Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Farmer Profile Summary Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-5 saas-card p-6 sm:p-8 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Farmer Profile Summary
              </h3>
              <Link to="/profile" className="text-xs font-bold text-primary hover:underline">
                Edit Profile
              </Link>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-emerald-400 p-0.5 shadow-md">
                <div className="w-full h-full bg-white dark:bg-slate-900 rounded-full flex items-center justify-center font-extrabold text-2xl text-primary overflow-hidden">
                  {(user?.avatar || user?.profile_photo) ? (
                    <img src={user.avatar || user.profile_photo} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    ((user?.fullName || user?.full_name || '').trim() || (user?.username || '').trim() || 'F').charAt(0).toUpperCase()
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {user?.fullName || user?.full_name || user?.username || 'Farmer User'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 text-xs font-bold mt-1.5">
                  <CheckCircle2 className="w-3 h-3 text-primary" /> Profile Verified
                </div>
              </div>
            </div>

            <div className="space-y-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" /> Phone Number
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {user?.phone || 'Not provided'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-slate-400" /> Preferred Language
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {user?.language || 'English'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Link 
              to="/profile" 
              className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition-colors"
            >
              <Settings className="w-4 h-4" /> Manage Account Credentials
            </Link>
          </div>
        </motion.div>

        {/* Active Selected Farm Summary Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-7 saas-card p-6 sm:p-8 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-primary" /> Active Selected Farm Summary
              </h3>
              <Link to="/select-farm" className="text-xs font-bold text-primary hover:underline">
                Switch Farm
              </Link>
            </div>

            {selectedFarm ? (
              <div className="space-y-6">
                
                {/* Farm Name Banner */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs mb-2">
                        Active Selected
                      </span>
                      <h2 className="text-2xl font-extrabold tracking-tight">{selectedFarm.name}</h2>
                      <p className="text-xs text-slate-300 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        {selectedFarm.village ? `${selectedFarm.village}, ` : ''}{selectedFarm.district || ''}{selectedFarm.state ? `, ${selectedFarm.state}` : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-black text-emerald-400">{selectedFarm.area}</span>
                      <span className="block text-xs text-slate-300">{selectedFarm.areaUnit || 'Acres'}</span>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                      Soil Type
                    </span>
                    <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-primary" />
                      {selectedFarm.soilType || selectedFarm.soil || 'Black Soil'}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                      Irrigation Type
                    </span>
                    <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Droplets className="w-4 h-4 text-primary" />
                      {selectedFarm.irrigationType || selectedFarm.irrigation || 'Drip Irrigation'}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                      Water Availability
                    </span>
                    <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Sprout className="w-4 h-4 text-primary" />
                      {selectedFarm.waterAvailability || 'Seasonal'}
                    </span>
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm">No active farm currently selected.</p>
                <Link to="/select-farm" className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl text-xs">
                  Choose Active Farm
                </Link>
              </div>
            )}
          </div>

          <div className="pt-6 flex flex-col sm:flex-row gap-3">
            <Link 
              to="/select-farm" 
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-xs transition-colors"
            >
              <Map className="w-4 h-4" /> Manage All Farms ({farms.length})
            </Link>
            <Link 
              to="/add-farm" 
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-xs shadow-md shadow-primary/20 transition-colors"
            >
              <PlusSquare className="w-4 h-4" /> Add Another Farm
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Dashboard;

