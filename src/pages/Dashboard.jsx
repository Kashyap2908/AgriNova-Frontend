import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FarmContext } from '../context/FarmContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  CloudSun, Droplets, Bug, Sprout, TrendingUp, IndianRupee, Map as MapIcon,
  Calendar, ArrowRight, PlusSquare, ChevronRight, CheckCircle2, AlertTriangle, CloudRain, Wind, Thermometer, Sparkles
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const StatCard = ({ title, value, icon: Icon, trend, trendUp, color }) => (
  <motion.div whileHover={{ y: -4 }} className="saas-card p-6 flex flex-col justify-between">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
          {trendUp ? '↑' : '↓'} {trend}
        </span>
      )}
    </div>
    <div>
      <h4 className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-1">{title}</h4>
      <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">{value}</h3>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { farms, selectedFarm } = useContext(FarmContext);
  
  const [activeChartTab, setActiveChartTab] = useState('Profit');

  // Chart Data mocks
  const chartData = {
    Profit: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Net Profit (₹)',
        data: [12000, 19000, 15000, 25000, 32000, 30000],
        borderColor: '#16A34A',
        backgroundColor: 'rgba(22, 163, 74, 0.1)',
        fill: true,
        tension: 0.4,
      }]
    },
    Yield: {
      labels: ['2019', '2020', '2021', '2022', '2023', '2024'],
      datasets: [{
        label: 'Yield (Tons)',
        data: [2.1, 2.3, 2.0, 2.4, 2.6, 2.9],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      }]
    },
    Expenses: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Operating Costs (₹)',
        data: [8000, 9000, 7000, 10000, 12000, 11000],
        backgroundColor: '#EF4444',
        borderRadius: 6,
      }]
    },
    'Market Price': {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [{
        label: `${selectedFarm?.crop || 'Crop'} Price/Quintal (₹)`,
        data: [4200, 4350, 4100, 4500],
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4,
      }]
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false } },
      x: { grid: { display: false, drawBorder: false } }
    }
  };

  // Get current date string
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Good Morning, {user?.username?.split(' ')[0] || 'Farmer'} 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> {today} • <CloudSun className="w-4 h-4 ml-2" /> 28°C Partly Cloudy
          </p>
        </div>
        <Link to="/add-farm" className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-lg shadow-slate-900/10 hover:shadow-xl hover:-translate-y-0.5 transition-all">
          <PlusSquare className="w-5 h-5" /> Add Farm
        </Link>
      </div>

      {/* AI Recommendation Highlight */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary to-emerald-400 rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-primary/20 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sprout className="w-48 h-48 -mt-10 -mr-10" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full font-bold text-xs uppercase tracking-wider mb-4">
              <Sparkles className="w-4 h-4" /> AI Recommendation
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">{selectedFarm?.crop || 'Cotton'} is expected to generate the highest profit this season.</h2>
            <ul className="space-y-2 text-primary-50 font-medium">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-200" /> No irrigation required today.</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-200" /> Low disease risk detected in your area.</li>
              <li className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-200" /> Market prices expected to increase by 5% next week.</li>
            </ul>
          </div>
          <Link to="/crop-recommendation" className="w-full sm:w-auto whitespace-nowrap px-8 py-4 bg-white text-primary font-bold rounded-xl shadow-lg hover:bg-slate-50 transition-colors">
            View Details
          </Link>
        </div>
      </motion.div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Expected Profit" value="₹3.2L" icon={IndianRupee} trend="12%" trendUp={true} color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50" />
        <StatCard title="Predicted Yield" value="28 Tons" icon={TrendingUp} trend="5%" trendUp={true} color="bg-blue-100 text-blue-600 dark:bg-blue-900/50" />
        <StatCard title="Water Status" value="Optimal" icon={Droplets} color="bg-cyan-100 text-cyan-600 dark:bg-cyan-900/50" />
        <StatCard title="Disease Risk" value="Low" icon={Bug} trend="Stable" trendUp={true} color="bg-amber-100 text-amber-600 dark:bg-amber-900/50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Analytics */}
        <div className="lg:col-span-2 saas-card p-6 flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">Main Analytics</h3>
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              {['Profit', 'Yield', 'Expenses', 'Market Price'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveChartTab(tab)}
                  className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${activeChartTab === tab ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-grow min-h-[300px]">
            <AnimatePresence mode="wait">
              <motion.div key={activeChartTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                {activeChartTab === 'Expenses' ? (
                  <Bar data={chartData[activeChartTab]} options={chartOptions} />
                ) : (
                  <Line data={chartData[activeChartTab]} options={chartOptions} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Weather Card */}
        <div className="saas-card p-6 bg-gradient-to-b from-blue-500 to-indigo-600 text-white border-0 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">Current Weather</h3>
              <CloudSun className="w-8 h-8 opacity-80" />
            </div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-6xl font-extrabold tracking-tighter">28°</span>
              <span className="text-xl font-medium opacity-80 mb-2">C</span>
            </div>
            <p className="text-xl font-medium opacity-90 mb-8">{selectedFarm?.location || 'Bhopal, MP'}</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 space-y-4">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 opacity-80"><Thermometer className="w-4 h-4" /> Humidity</span>
              <span className="font-bold">65%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 opacity-80"><CloudRain className="w-4 h-4" /> Rain Chance</span>
              <span className="font-bold">20%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 opacity-80"><Wind className="w-4 h-4" /> Wind</span>
              <span className="font-bold">12 km/h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: My Farms & Activities */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* My Farms List */}
        <div className="xl:col-span-2 saas-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">My Farms</h3>
            <Link to="/farms" className="text-sm font-semibold text-primary hover:text-primary-dark flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {farms.map((farm) => (
              <div key={farm.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200">
                    <img src={`https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200&h=200&fit=crop`} alt="Farm" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">{farm.name}</h4>
                    <p className="text-sm text-slate-500">{farm.location} • {farm.area}</p>
                    <span className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {farm.crop}
                    </span>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${farm.health === 'Excellent' || farm.health === 'Good' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {farm.health === 'Excellent' || farm.health === 'Good' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    {farm.health}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities Timeline */}
        <div className="saas-card p-6">
          <h3 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-6">Recent Activities</h3>
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
            
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-800 bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <Sprout className="w-4 h-4" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-800">
                <div className="flex items-center justify-between space-x-2 mb-1">
                  <div className="font-bold text-slate-900 dark:text-white text-sm">Crop Predicted</div>
                  <time className="text-xs font-medium text-emerald-500">2h ago</time>
                </div>
                <div className="text-sm text-slate-500">AI recommended Soybean for Green Valley.</div>
              </div>
            </div>

            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-800 bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <CloudRain className="w-4 h-4" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-800">
                <div className="flex items-center justify-between space-x-2 mb-1">
                  <div className="font-bold text-slate-900 dark:text-white text-sm">Weather Alert</div>
                  <time className="text-xs font-medium text-slate-400">1d ago</time>
                </div>
                <div className="text-sm text-slate-500">Heavy rainfall expected tomorrow.</div>
              </div>
            </div>

            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-800 bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <MapIcon className="w-4 h-4" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-800">
                <div className="flex items-center justify-between space-x-2 mb-1">
                  <div className="font-bold text-slate-900 dark:text-white text-sm">Farm Added</div>
                  <time className="text-xs font-medium text-slate-400">3d ago</time>
                </div>
                <div className="text-sm text-slate-500">Riverbed Plot was successfully mapped.</div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
