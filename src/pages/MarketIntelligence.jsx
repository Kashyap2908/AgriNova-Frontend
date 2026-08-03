import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, BarChart2, Compass, AlertCircle, RefreshCw, Download, ArrowRight, ShieldCheck, MapPin, Store, IndianRupee, Activity, Target, Leaf } from 'lucide-react';
import { FarmContext } from '../context/farm-context';
import { fetchMarketIntelligenceApi } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MarketIntelligence = () => {
  const { selectedFarm, isFarmsLoaded } = useContext(FarmContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [historicalFilter, setHistoricalFilter] = useState('30D');

  const fetchIntelligence = async () => {
    if (!selectedFarm) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchMarketIntelligenceApi(selectedFarm.id);
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.message || 'Failed to retrieve market intelligence.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while fetching live market data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedFarm) {
      fetchIntelligence();
    } else {
      setData(null);
    }
  }, [selectedFarm]);

  const handlePrint = () => {
    window.print();
  };

  if (!isFarmsLoaded) return <div className="p-8 text-center text-slate-500">Loading Farm Data...</div>;

  if (!selectedFarm) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
          <div>
            <h3 className="font-bold text-amber-800 dark:text-amber-200">No Farm Selected</h3>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">Please select a farm from the dashboard to view market intelligence.</p>
          </div>
        </div>
      </div>
    );
  }

  // Skeletons
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="animate-pulse flex gap-4 mb-8">
           <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/3"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
           {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>)}
        </div>
        <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse"></div>
        <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center min-h-[50vh]">
         <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
         <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Intelligence Fetch Failed</h2>
         <p className="text-slate-500 dark:text-slate-400 mb-6">{error}</p>
         <button onClick={fetchIntelligence} className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Retry Connection
         </button>
      </div>
    );
  }

  if (!data) return null;

  const {
    crop, best_market, best_modal_price, trend, analytics_data, markets_data, created_at
  } = data;

  const stats = analytics_data?.statistics || {};
  const brief = analytics_data?.ai_market_brief || [];
  const insights = analytics_data?.market_insights || [];
  const bestWindow = analytics_data?.best_selling_window || {};
  const historicalTrends = analytics_data?.historical_trends || {};
  
  const currentTrendData = historicalTrends[historicalFilter] || [];

  const lineChartData = {
    labels: currentTrendData.map(d => d.date),
    datasets: [
      {
        label: 'Modal Price (₹)',
        data: currentTrendData.map(d => d.price),
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.15)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#0ea5e9',
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBorderWidth: 2,
      },
      {
        label: 'Regional Average (₹)',
        data: currentTrendData.map(() => stats.average_price || 0),
        borderColor: '#94a3b8',
        borderDash: [6, 6],
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 0,
        fill: false,
        tension: 0,
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true, 
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          color: '#64748b',
          font: { weight: 'bold' }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
      },
    },
    scales: {
      y: { 
        min: stats.lowest_price ? Math.floor(stats.lowest_price * 0.9) : 0,
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: '#64748b', font: { weight: 'bold' } }
      },
      x: { 
        grid: { display: false },
        ticks: { color: '#64748b', maxRotation: 45, minRotation: 45 }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 print:p-0 print:max-w-full print:m-0" id="intelligence-dashboard">
      
      {/* Header & Print */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
              <BarChart2 className="w-7 h-7" />
            </div>
            Market Intelligence
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">
            Live executive dashboard for {selectedFarm.farm_name} ({crop}).
          </p>
        </div>
        <div className="flex items-center gap-3 print:hidden">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors font-semibold text-sm shadow-sm"
          >
            <Download className="w-4 h-4" /> Download Report
          </button>
          <Link 
            to="/market-intelligence/history" 
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-semibold text-sm shadow-sm"
          >
            History & Logs
          </Link>
        </div>
      </div>

      {/* Section 1: Market Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 print:grid-cols-3 print:gap-2 print:break-inside-avoid">
        {[
          { label: 'Current Crop', value: crop, icon: Leaf },
          { label: 'Top Modal Price', value: `₹${best_modal_price || 0}`, icon: IndianRupee },
          { label: 'Best Market', value: best_market?.split(' ')[0] || 'N/A', icon: Store },
          { label: 'Market Trend', value: trend || 'STABLE', icon: trend === 'UP' ? LineChart : Activity },
          { label: 'Regional Avg', value: `₹${stats.average_price || 0}`, icon: Target },
          { label: 'Last Updated', value: created_at ? new Date(created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A', icon: RefreshCw },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-center backdrop-blur-md">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{kpi.label}</p>
            <div className="flex items-center gap-2 mt-2">
              <kpi.icon className="w-4 h-4 text-primary opacity-80" />
              <span className="text-lg font-extrabold text-slate-800 dark:text-white truncate">{kpi.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-3 print:break-inside-avoid">
        {/* Section 2: AI Market Brief */}
        <div className="lg:col-span-2 print:col-span-2 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/10 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
          <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-300 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" /> Today's Market Brief
          </h3>
          <ul className="space-y-3">
            {brief.map((point, idx) => (
              <li key={idx} className="flex items-start gap-3 text-slate-700 dark:text-slate-300 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0"></div>
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Section 6: Best Selling Window */}
        <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-md flex flex-col justify-center">
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Compass className="w-4 h-4" /> Best Selling Window
          </h3>
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mb-2">
            {bestWindow.period}
          </p>
          <div className="space-y-1 mt-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <span className="font-bold text-slate-800 dark:text-slate-200">Trend: </span> {bestWindow.trend}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <span className="font-bold text-slate-800 dark:text-slate-200">Action: </span> {bestWindow.action}
            </p>
          </div>
        </div>
      </div>

      {/* Section 4: Historical Market Trends */}
      <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-md print:break-inside-avoid print:mt-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <LineChart className="w-5 h-5 text-sky-500" /> Historical Market Trends
          </h3>
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg print:hidden">
            {['7D', '30D', '3M', '6M', '1Y'].map(filter => (
              <button
                key={filter}
                onClick={() => setHistoricalFilter(filter)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${historicalFilter === filter ? 'bg-white dark:bg-slate-700 shadow text-sky-600 dark:text-sky-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        <div className="h-72">
           <Line data={lineChartData} options={lineChartOptions} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-3 print:break-inside-avoid print:mt-4">
        {/* Section 3: Market Comparison Table */}
        <div className="lg:col-span-2 print:col-span-2 bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-md overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Store className="w-5 h-5 text-amber-500" /> Market Comparison
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50">
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Market</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Min Price</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Max Price</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Modal Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(markets_data || []).map((mkt, idx) => {
                  const isBest = mkt.modal_price === best_modal_price;
                  return (
                    <tr key={idx} className={isBest ? 'bg-amber-50/50 dark:bg-amber-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors'}>
                      <td className="px-5 py-4">
                        <span className={`font-bold ${isBest ? 'text-amber-700 dark:text-amber-400 flex items-center gap-2' : 'text-slate-700 dark:text-slate-300'}`}>
                          {mkt.market}
                          {isBest && <span className="text-[10px] bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full">BEST</span>}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500">₹{mkt.minimum_price}</td>
                      <td className="px-5 py-4 text-sm text-slate-500">₹{mkt.maximum_price}</td>
                      <td className={`px-5 py-4 font-bold ${isBest ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        ₹{mkt.modal_price}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 5: Market Insights */}
        <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-md flex flex-col">
          <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-500" /> Key Insights
            </h3>
          </div>
          <div className="p-5 flex-1">
             <ul className="space-y-4">
               {insights.map((insight, idx) => (
                 <li key={idx} className="flex gap-3">
                   <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                     <span className="text-xs font-bold">✓</span>
                   </div>
                   <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{insight}</p>
                 </li>
               ))}
             </ul>
          </div>
        </div>
      </div>

    </div>
  );
};

export default MarketIntelligence;
