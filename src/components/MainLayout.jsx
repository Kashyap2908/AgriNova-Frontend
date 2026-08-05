import React, { useContext, useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/auth-context';
import { FarmContext } from '../context/farm-context';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Map as MapIcon, PlusSquare, CloudSun, Sprout, TrendingUp, IndianRupee, 
  BarChart3, ImagePlus, Bug, FlaskConical, Droplets, PieChart, MessageSquare, Bell, Settings, LogOut,
  Search, Sun, Moon, Menu, X, ChevronDown, Leaf, Sparkles, ArrowRight, User
} from 'lucide-react';
import NotificationBell from './NotificationBell';

const SidebarItem = ({ icon: Icon, label, to, active, onClick }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
      ${active 
        ? 'bg-primary text-white shadow-md shadow-primary/20' 
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
      }`}
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </Link>
);

const MainLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const { farms, selectedFarm, changeFarm } = useContext(FarmContext);
  const location = useLocation();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [farmDropdownOpen, setFarmDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const avatarPhoto = user?.avatar || user?.profile_photo || null;
  const fullNameVal = user?.fullName || user?.full_name || '';
  const usernameVal = user?.username || '';

  const avatarInitial = fullNameVal.trim()
    ? fullNameVal.trim().charAt(0).toUpperCase()
    : (usernameVal.trim() ? usernameVal.trim().charAt(0).toUpperCase() : 'U');

  const displayName = fullNameVal.trim() || usernameVal || 'User';
  const displayEmail = user?.email || '';

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

  const navGroups = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
        { label: 'My Farms', icon: MapIcon, to: '/farms' },
        { label: 'Add Farm', icon: PlusSquare, to: '/add-farm' },
        { label: 'Weather', icon: CloudSun, to: '/weather' },
      ]
    },
    {
      title: 'Machine Learning Insights',
      items: [
        { label: 'Crop Recommendation', icon: Sprout, to: '/crop-recommendation' },
        { label: 'Yield Prediction', icon: TrendingUp, to: '/yield-prediction' },
        { label: 'Profit Prediction', icon: IndianRupee, to: '/profit-prediction' },
        { label: 'Market Intelligence', icon: BarChart3, to: '/market-intelligence' },
        { label: 'Disease Detection', icon: ImagePlus, to: '/disease-detection' },
        { label: 'Pest Prediction', icon: Bug, to: '/pest-prediction' },
      ]
    },
    {
      title: 'Operations',
      items: [
        { label: 'Fertilizers', icon: FlaskConical, to: '/fertilizers' },
        { label: 'Irrigation', icon: Droplets, to: '/irrigation' },
        { label: 'Analytics', icon: PieChart, to: '/analytics' },
      ]
    }
  ];

  const getBreadcrumb = () => {
    const path = location.pathname.split('/')[1];
    if (!path) return 'Dashboard';
    return path.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="h-screen w-full flex bg-slate-50 dark:bg-slate-900 transition-colors overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`print:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:flex-shrink-0 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Logo */}
        <div className="h-20 flex items-center px-8 border-b border-slate-200 dark:border-slate-800">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-md shadow-primary/30">
              <Leaf className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
              AgriNova
            </h1>
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="ml-auto lg:hidden text-slate-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-6 px-4 space-y-8">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              <h3 className="px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item, itemIdx) => (
                  <SidebarItem 
                    key={itemIdx}
                    icon={item.icon}
                    label={item.label}
                    to={item.to}
                    active={location.pathname === item.to}
                    onClick={() => setIsSidebarOpen(false)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Nav */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
          <SidebarItem icon={MessageSquare} label="AI Assistant" to="/assistant" active={location.pathname === '/assistant'} />
          <SidebarItem icon={Settings} label="Settings" to="/settings" active={location.pathname === '/settings'} />

          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 font-medium text-sm transition-colors">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Topbar */}
        <header className="print:hidden h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8 z-30 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden">
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white hidden sm:block">
              {getBreadcrumb()}
            </h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            
            {/* Search */}
            <div className="hidden md:flex relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-transparent rounded-full text-sm focus:bg-white dark:focus:bg-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none w-64 transition-all dark:text-white"
              />
            </div>

            {/* Farm Selector Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setFarmDropdownOpen(!farmDropdownOpen)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl font-semibold text-sm transition-colors"
              >
                <span className="max-w-[100px] sm:max-w-[150px] truncate">{selectedFarm?.name || 'Select Farm'}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              <AnimatePresence>
                {farmDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 w-60 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50"
                  >
                    <div className="p-2 border-b border-slate-100 dark:border-slate-700 font-bold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3">
                      Select Active Farm
                    </div>
                    {farms.map(farm => (
                      <button 
                        key={farm.id}
                        onClick={() => { changeFarm(farm.id); setFarmDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors
                          ${selectedFarm?.id === farm.id ? 'text-primary font-bold bg-primary/5' : 'text-slate-700 dark:text-slate-300'}`}
                      >
                        <span className="truncate">{farm.name}</span>
                        {selectedFarm?.id === farm.id && <div className="w-2 h-2 rounded-full bg-primary"></div>}
                      </button>
                    ))}
                    <div className="border-t border-slate-100 dark:border-slate-700 p-2 space-y-1">
                      <Link 
                        to="/select-farm" 
                        onClick={() => setFarmDropdownOpen(false)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <MapIcon className="w-3.5 h-3.5" /> Manage All Farms
                      </Link>
                      <Link 
                        to="/add-farm" 
                        onClick={() => setFarmDropdownOpen(false)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <PlusSquare className="w-3.5 h-3.5" /> Add New Farm
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 border-l border-slate-200 dark:border-slate-800 pl-3 sm:pl-6">
              <button onClick={toggleTheme} className="p-2 text-slate-400 hover:text-amber-500 bg-slate-100 dark:bg-slate-800 rounded-full transition-colors">
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <NotificationBell />
              <div className="relative ml-1">
                <button 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="w-9 h-9 rounded-full bg-gradient-to-r from-primary to-emerald-400 border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden"
                >
                  {avatarPhoto ? (
                    <img src={avatarPhoto} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                      {avatarInitial}
                    </div>
                  )}
                </button>
                
                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50"
                    >
                      <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                        <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{displayName}</p>
                        {displayEmail && <p className="text-xs text-slate-500 truncate">{displayEmail}</p>}
                      </div>
                      <div className="p-2">
                        <Link to="/profile" onClick={() => setProfileDropdownOpen(false)} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-primary rounded-lg transition-colors">
                          <User className="w-4 h-4" /> My Profile
                        </Link>
                        <Link to="/settings" onClick={() => setProfileDropdownOpen(false)} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-primary rounded-lg transition-colors">
                          <Settings className="w-4 h-4" /> Settings
                        </Link>
                      </div>
                      <div className="border-t border-slate-100 dark:border-slate-700 p-2">
                        <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors">
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Main View */}
        <main className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-8 relative">
          <Outlet />
        </main>

      </div>


      {/* Floating AI Chat Widget Button */}
      <div className="fixed bottom-6 right-6 z-50 print:hidden">
        <Link 
          to="/assistant"
          className="group flex items-center justify-center w-14 h-14 bg-primary hover:bg-primary-dark text-white rounded-full shadow-[0_8px_30px_rgb(22,163,74,0.3)] transition-all transform hover:scale-105 hover:-translate-y-1 relative"
        >
          <MessageSquare className="w-6 h-6" />
          
          <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 border-2 border-white dark:border-slate-900 rounded-full"></span>

          {/* Tooltip */}
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none flex items-center gap-2">
            Ask AgriNova AI <Sparkles className="w-3 h-3 text-emerald-400 dark:text-primary" />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default MainLayout;
