import React, { useState, useEffect, useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, BarChart2, Compass, AlertCircle, RefreshCw, Download, 
  ArrowRight, ShieldCheck, MapPin, Store, IndianRupee, Activity, Target, 
  Leaf, Calendar, TrendingUp, TrendingDown, Sparkles, Cpu, Layers, Sprout, ChevronDown
} from 'lucide-react';
import { FarmContext } from '../context/farm-context';
import { fetchMarketIntelligenceApi, fetchAvailableCropsApi } from '../services/api';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCrop = searchParams.get('crop');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [historicalTab, setHistoricalTab] = useState('Weekly'); // 'Weekly', 'Monthly', 'Yearly'
  const [selectedCrop, setSelectedCrop] = useState(urlCrop || '');
  const [availableCrops, setAvailableCrops] = useState([
    'Cotton', 'Rice', 'Wheat', 'Maize', 'Sugarcane', 
    'Soybean', 'Groundnut', 'Mungbean', 'Tomato', 'Onion', 
    'Jowar', 'Bajra', 'Pulses'
  ]);

  const fetchIntelligence = async (targetCrop = null) => {
    if (!selectedFarm) return;
    
    setLoading(true);
    setError(null);
    
    const cropToFetch = targetCrop !== null ? targetCrop : (selectedCrop || urlCrop || null);

    try {
      const response = await fetchMarketIntelligenceApi(selectedFarm.id, cropToFetch);
      if (response.success) {
        setData(response.data);
        if (response.data.crop && !selectedCrop) {
          setSelectedCrop(response.data.crop);
        }
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
      fetchAvailableCropsApi(selectedFarm.id)
        .then(res => {
          if (res.success && res.data?.crops) {
            setAvailableCrops(prev => Array.from(new Set([...res.data.crops, ...prev])));
          }
        })
        .catch(err => console.warn("Available crops fetch error:", err));
    } else {
      setData(null);
    }
  }, [selectedFarm]);

  const handleCropChange = (newCrop) => {
    setSelectedCrop(newCrop);
    setSearchParams({ crop: newCrop });
    fetchIntelligence(newCrop);
  };

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
         <button onClick={fetchIntelligence} className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Retry Connection
         </button>
      </div>
    );
  }

  if (!data) return null;

  const {
    crop, state, district, market, current_price, weekly_price_history,
    monthly_price_history, yearly_price_history, predictions, markets_data, trend
  } = data;

  const currentInfo = current_price || {};

  // Select historical graph dataset based on tab
  let historicalDataset = [];
  if (historicalTab === 'Weekly') historicalDataset = weekly_price_history || [];
  else if (historicalTab === 'Monthly') historicalDataset = monthly_price_history || [];
  else historicalDataset = yearly_price_history || [];

  const lineChartData = {
    labels: historicalDataset.map(d => d.date),
    datasets: [
      {
        label: 'Modal Price (₹)',
        data: historicalDataset.map(d => d.modal_price),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        fill: true,
        tension: 0.3,
        borderWidth: 3,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#10b981',
        pointRadius: 3,
      },
      {
        label: 'Min Price (₹)',
        data: historicalDataset.map(d => d.min_price),
        borderColor: '#94a3b8',
        borderDash: [4, 4],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
      },
      {
        label: 'Max Price (₹)',
        data: historicalDataset.map(d => d.max_price),
        borderColor: '#3b82f6',
        borderDash: [4, 4],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      y: { grid: { color: 'rgba(148, 163, 184, 0.1)' } },
      x: { grid: { display: false } }
    }
  };

  // Predictions
  const shortTerm10Days = predictions?.short_term_10_days || [];
  const mediumTermMonths = predictions?.medium_term_months || [];

  // Short term chart data
  const shortTermChartData = {
    labels: shortTerm10Days.map(d => d.date),
    datasets: [
      {
        label: 'Predicted Modal Price (₹)',
        data: shortTerm10Days.map(d => d.predicted_modal_price),
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
        fill: true,
        tension: 0.3,
        borderWidth: 3,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#8b5cf6',
        pointRadius: 4,
      }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 print:p-0 print:max-w-full print:m-0" id="intelligence-dashboard">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <BarChart2 className="w-7 h-7" />
            </div>
            Market Prices
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">
            Current market prices and trends for {selectedFarm.farm_name} ({crop}).
          </p>
        </div>
        <div className="flex items-center gap-3 print:hidden">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 rounded-xl hover:bg-indigo-100 transition-colors font-semibold text-sm shadow-sm"
          >
            <Download className="w-4 h-4" /> Download Report
          </button>
        </div>
      </div>

      {/* ── CROP SELECTION DROPDOWN CONTROL BAR ── */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <label htmlFor="crop-select-main" className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Select Crop to Analyze
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Active Crop: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{crop}</strong> (Loads from MarketCache instantly)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <select
              id="crop-select-main"
              value={selectedCrop || crop || ''}
              onChange={(e) => handleCropChange(e.target.value)}
              className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-3 pr-10 text-sm font-extrabold text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer transition-all shadow-sm"
            >
              {crop && !availableCrops.includes(crop) && (
                <option value={crop}>{crop} (Current Selected)</option>
              )}
              {availableCrops.map((cName) => (
                <option key={cName} value={cName}>
                  {cName} {cName === crop ? '★ (Top Recommended)' : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* SECTION 1: Current Market Price Card */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Store className="w-48 h-48 text-white" />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5" /> {market || `${district} APMC`}, {state}
            </div>
            <span className="text-xs text-emerald-200 font-bold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Updated: {currentInfo.last_updated || 'Today'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-white/15 pb-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-emerald-200 font-bold">Crop Commodity</p>
              <h2 className="text-4xl sm:text-5xl font-black text-white mt-1">{crop}</h2>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs uppercase tracking-widest text-emerald-200 font-bold">Current Modal Price</p>
              <p className="text-4xl sm:text-5xl font-black text-amber-300">₹{currentInfo.modal_price || 0}<span className="text-sm text-emerald-200 font-normal ml-1">/ quintal</span></p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="bg-black/25 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <p className="text-[11px] text-emerald-200 font-bold uppercase">Minimum Price</p>
              <p className="text-xl font-extrabold text-white mt-1">₹{currentInfo.minimum_price || 0}</p>
            </div>
            <div className="bg-black/25 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <p className="text-[11px] text-amber-200 font-bold uppercase">Modal Price</p>
              <p className="text-xl font-extrabold text-amber-300 mt-1">₹{currentInfo.modal_price || 0}</p>
            </div>
            <div className="bg-black/25 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <p className="text-[11px] text-emerald-200 font-bold uppercase">Maximum Price</p>
              <p className="text-xl font-extrabold text-white mt-1">₹{currentInfo.maximum_price || 0}</p>
            </div>
            <div className="bg-black/25 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <p className="text-[11px] text-cyan-200 font-bold uppercase">Arrival Quantity</p>
              <p className="text-xl font-extrabold text-cyan-300 mt-1">{currentInfo.arrival_quantity || 'N/A'} <span className="text-xs font-normal">Tons</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Historical Market Trends (Weekly, Monthly, Yearly Tabs) */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <LineChart className="w-5 h-5 text-emerald-500" /> Historical Price Trends (Market Cache)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Reading strictly from cached rolling history records ({historicalDataset.length} records).
            </p>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl">
            {['Weekly', 'Monthly', 'Yearly'].map(tab => (
              <button
                key={tab}
                onClick={() => setHistoricalTab(tab)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  historicalTab === tab 
                    ? 'bg-emerald-500 text-white shadow-md' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {tab === 'Weekly' ? 'Weekly (7 Days)' : (tab === 'Monthly' ? 'Monthly (30 Days)' : 'Yearly (365 Days)')}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72">
          {historicalDataset.length > 0 ? (
            <Line data={lineChartData} options={lineChartOptions} />
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 font-medium text-sm">
              No historical cache records available for this tab.
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: ML Market Price Predictions */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">ML Market Price Predictions</h3>
            <p className="text-xs text-slate-500">Trained exclusively on MarketCache history. Short-term daily & medium-term monthly forecasts.</p>
          </div>
        </div>

        {/* Short-Term (Next 10 Days) & Medium-Term (Next 3-4 Months) Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Short-Term Prediction Card (Next 10 Days) */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-indigo-100 dark:border-slate-700 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-500" /> Short-Term Prediction (Next 10 Days)
                </h4>
                <span className="text-[11px] font-extrabold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-full">
                  10 Daily Forecasts
                </span>
              </div>

              <div className="h-56 mb-4">
                <Line data={shortTermChartData} options={lineChartOptions} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
                {shortTerm10Days.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl text-center border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 font-bold">{item.date?.slice(5)}</p>
                    <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 mt-0.5">₹{item.predicted_modal_price}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Medium-Term Prediction Card (Next 3-4 Months) */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-cyan-100 dark:border-slate-700 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-cyan-500" /> Medium-Term Prediction (Next 3–4 Months)
                </h4>
                <span className="text-[11px] font-extrabold bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 px-2.5 py-1 rounded-full">
                  Monthly Trends
                </span>
              </div>

              <div className="space-y-3">
                {mediumTermMonths.map((item, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Month {item.month_number}</span>
                      <h5 className="font-extrabold text-slate-800 dark:text-white text-base">{item.month_name}</h5>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <p className="text-xs text-slate-400 font-bold">Predicted Avg</p>
                        <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">₹{item.predicted_avg_price}</p>
                      </div>
                      <span className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 ${
                        item.trend === 'UPWARD' 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' 
                          : item.trend === 'DOWNWARD' 
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                      }`}>
                        {item.trend === 'UPWARD' && <TrendingUp className="w-3.5 h-3.5" />}
                        {item.trend === 'DOWNWARD' && <TrendingDown className="w-3.5 h-3.5" />}
                        {item.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 4: Regional Market Comparison Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Store className="w-5 h-5 text-amber-500" /> APMC Market Comparison ({district}, {state})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50">
                <th className="px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Market APMC</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Min Price</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Max Price</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Modal Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(markets_data || []).map((mkt, idx) => {
                const isBest = mkt.modal_price === currentInfo.modal_price;
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

    </div>
  );
};

export default MarketIntelligence;
