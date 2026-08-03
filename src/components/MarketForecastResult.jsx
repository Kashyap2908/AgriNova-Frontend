import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Minus, IndianRupee, MapPin, Store, AlertCircle, Clock, 
  BarChart2, Activity, ArrowRight, ShieldCheck, Target, Compass
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const MarketForecastResult = ({ result }) => {
  if (!result) return null;

  const {
    crop,
    best_market,
    best_modal_price,
    forecast_price,
    trend,
    recommendation,
    confidence,
    markets_data,
    created_at,
    analytics_data,
    opportunity_score,
    market_health_index
  } = result;

  const stats = analytics_data?.statistics || {};
  const geo = analytics_data?.geographic_analysis || {};
  const recEngine = analytics_data?.recommendation_engine || {};

  const isUp = trend === 'UP';
  const isDown = trend === 'DOWN';

  // Format data for Chart.js
  const barChartData = {
    labels: markets_data.slice(0, 5).map(m => m.market.substring(0, 15) + '...'),
    datasets: [
      {
        label: 'Modal Price (₹)',
        data: markets_data.slice(0, 5).map(m => m.modal_price),
        backgroundColor: 'rgba(22, 163, 74, 0.8)',
        borderRadius: 6,
      },
      {
        label: 'Est. Net Price (₹)',
        data: markets_data.slice(0, 5).map(m => m.net_price),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderRadius: 6,
      }
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: false }
    },
    scales: {
      y: { min: stats.lowest_price ? stats.lowest_price * 0.9 : 0 }
    }
  };

  const pieChartData = {
    labels: ['High Price', 'Medium Price', 'Low Price'],
    datasets: [
      {
        data: [
          markets_data.filter(m => m.modal_price > stats.average_price * 1.02).length,
          markets_data.filter(m => m.modal_price >= stats.average_price * 0.98 && m.modal_price <= stats.average_price * 1.02).length,
          markets_data.filter(m => m.modal_price < stats.average_price * 0.98).length,
        ],
        backgroundColor: [
          'rgba(22, 163, 74, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* 1. Summary Dashboard / Recommendation Engine */}
      <div className={`bg-gradient-to-r rounded-2xl p-6 shadow-sm border ${
        recEngine.action === 'SELL NOW' 
          ? 'from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800' 
          : 'from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/20 border-amber-200 dark:border-amber-800'
      }`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className={`w-6 h-6 ${recEngine.action === 'SELL NOW' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`} />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">AI Strategy: {recEngine.action}</h2>
            </div>
            <ul className="space-y-1">
              {recEngine.reasons?.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <ArrowRight className="w-4 h-4 mt-0.5 opacity-50" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex gap-4">
            <div className="text-center p-3 bg-white/50 dark:bg-slate-900/50 rounded-xl backdrop-blur-sm">
              <p className="text-xs font-bold text-slate-500 uppercase">Opportunity Score</p>
              <p className={`text-3xl font-extrabold ${opportunity_score >= 80 ? 'text-emerald-600 dark:text-emerald-400' : opportunity_score >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                {opportunity_score}
              </p>
            </div>
            <div className="text-center p-3 bg-white/50 dark:bg-slate-900/50 rounded-xl backdrop-blur-sm">
              <p className="text-xs font-bold text-slate-500 uppercase">Health Index</p>
              <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{market_health_index}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Market Overview KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-center">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Markets Analysed</p>
          <div className="flex items-center gap-2 mt-1">
            <Store className="w-5 h-5 text-primary" />
            <span className="text-2xl font-bold text-slate-800 dark:text-white">{stats.total_markets_analyzed}</span>
          </div>
        </div>
        <div className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-center">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Regional Average</p>
          <div className="flex items-center gap-1 mt-1">
            <IndianRupee className="w-4 h-4 text-slate-400" />
            <span className="text-2xl font-bold text-slate-800 dark:text-white">{stats.average_price}</span>
          </div>
        </div>
        <div className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-center">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Market Volatility</p>
          <div className="flex items-center gap-2 mt-1">
            <Activity className={`w-5 h-5 ${stats.volatility_index === 'Low' ? 'text-emerald-500' : 'text-rose-500'}`} />
            <span className="text-xl font-bold text-slate-800 dark:text-white">{stats.volatility_index}</span>
          </div>
        </div>
        <div className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-center">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Price Spread</p>
          <div className="flex items-center gap-1 mt-1">
            <IndianRupee className="w-4 h-4 text-slate-400" />
            <span className="text-2xl font-bold text-slate-800 dark:text-white">{stats.price_spread}</span>
          </div>
        </div>
      </div>

      {/* 3. Interactive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/80 dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4" /> Top 5 Markets Comparison (Modal vs Net)
          </h3>
          <div className="h-64">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>
        <div className="bg-white/80 dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4" /> Price Distribution
          </h3>
          <div className="flex-1 min-h-[200px] flex items-center justify-center relative">
             <Pie data={pieChartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
          </div>
        </div>
      </div>

      {/* 4. Geographic & Multi-Market Comparison */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-500" /> Advanced Market Routing
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Live data sorted by Net Profitability (Price - Mock Transport Cost)</p>
          </div>
          <div className="text-right">
             <p className="text-xs font-bold text-slate-400">BEST NET MARKET</p>
             <p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">{geo.best_net_market}</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Rank</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Market</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Modal Price</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Est. Dist</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Transport</th>
                <th className="px-6 py-4 text-sm font-bold text-indigo-600 dark:text-indigo-400">Net Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {markets_data && markets_data.map((mkt, idx) => (
                <tr key={idx} className={`transition-colors ${idx === 0 ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${idx === 0 ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${idx === 0 ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-800 dark:text-white'}`}>{mkt.market}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-400">₹{mkt.modal_price}</td>
                  <td className="px-6 py-4 text-slate-500 text-sm">~{mkt.distance_km} km</td>
                  <td className="px-6 py-4 text-rose-500 text-sm">-₹{mkt.transport_cost}</td>
                  <td className="px-6 py-4 font-bold text-indigo-700 dark:text-indigo-400">₹{mkt.net_price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <p className="text-xs text-center text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
        <Target className="w-3 h-3" /> Forecast Model: {result.forecast_source} | Data Source: {result.api_source} | {new Date(created_at).toLocaleString()}
      </p>
    </motion.div>
  );
};

// Add missing icon that was used
const PieChart = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
    <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
  </svg>
);

export default MarketForecastResult;
