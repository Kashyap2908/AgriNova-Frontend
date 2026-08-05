import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FarmContext } from '../context/farm-context';
import { fetchProfitAnalysisApi, fetchAvailableCropsApi } from '../services/api';
import { Link } from 'react-router-dom';
import { 
  IndianRupee, TrendingUp, TrendingDown, MapPin, Calendar, Sprout, 
  Edit3, Trash2, RotateCcw, AlertTriangle, ShieldCheck, CheckCircle2, 
  HelpCircle, ChevronDown, RefreshCw, BarChart3, Layers, Info, DollarSign
} from 'lucide-react';

const ProfitAnalysis = () => {
  const { selectedFarm } = useContext(FarmContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Available crops list for crop dropdown
  const [availableCrops, setAvailableCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState(null);

  // Custom cost state (temporary cost object in React state)
  const [customCosts, setCustomCosts] = useState(null);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  // Temporary edit fields for customize modal
  const [editCosts, setEditCosts] = useState({
    seed_cost: '',
    fertilizer_cost: '',
    labour_cost: '',
    irrigation_cost: '',
    machinery_cost: '',
    other_cost: ''
  });

  // Load available crops for farm
  useEffect(() => {
    if (selectedFarm?.id) {
      fetchAvailableCropsApi(selectedFarm.id)
        .then(res => {
          if (res.success && res.data?.crops) {
            setAvailableCrops(res.data.crops);
          }
        })
        .catch(err => console.warn('Crops fetch error:', err));
    }
  }, [selectedFarm?.id]);

  // Load Profit Analysis data from backend API
  const loadProfitAnalysis = async (crop = selectedCrop, overrides = customCosts) => {
    if (!selectedFarm) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetchProfitAnalysisApi(selectedFarm.id, crop, overrides);
      if (res.success && res.data) {
        setData(res.data);
        if (!selectedCrop) {
          setSelectedCrop(res.data.crop);
        }
        // Initialize edit costs state from response total farm costs if not already set
        if (!overrides) {
          const cb = res.data.cost_breakdown;
          setEditCosts({
            seed_cost: Math.round(cb.seed_cost),
            fertilizer_cost: Math.round(cb.fertilizer_cost),
            labour_cost: Math.round(cb.labour_cost),
            irrigation_cost: Math.round(cb.irrigation_cost),
            machinery_cost: Math.round(cb.machinery_cost),
            other_cost: Math.round(cb.other_cost)
          });
        }
      } else {
        throw new Error(res.error || 'Failed to compute profit analysis');
      }
    } catch (err) {
      console.error('Profit Analysis error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load profit analysis.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfitAnalysis(selectedCrop, customCosts);
  }, [selectedFarm, selectedCrop]);

  const handleCropChange = (e) => {
    const newCrop = e.target.value;
    setSelectedCrop(newCrop);
    setCustomCosts(null); // Reset custom costs when crop changes
  };

  // Open Customize Cost Modal
  const openCustomizeModal = () => {
    if (data?.cost_breakdown) {
      const cb = data.cost_breakdown;
      setEditCosts({
        seed_cost: Math.round(cb.seed_cost),
        fertilizer_cost: Math.round(cb.fertilizer_cost),
        labour_cost: Math.round(cb.labour_cost),
        irrigation_cost: Math.round(cb.irrigation_cost),
        machinery_cost: Math.round(cb.machinery_cost),
        other_cost: Math.round(cb.other_cost)
      });
    }
    setIsCustomizeOpen(true);
  };

  // Apply custom costs edit
  const applyCustomCosts = () => {
    const numericCosts = {
      seed_cost: parseFloat(editCosts.seed_cost) || 0,
      fertilizer_cost: parseFloat(editCosts.fertilizer_cost) || 0,
      labour_cost: parseFloat(editCosts.labour_cost) || 0,
      irrigation_cost: parseFloat(editCosts.irrigation_cost) || 0,
      machinery_cost: parseFloat(editCosts.machinery_cost) || 0,
      other_cost: parseFloat(editCosts.other_cost) || 0,
    };
    setCustomCosts(numericCosts);
    setIsCustomizeOpen(false);
    loadProfitAnalysis(selectedCrop, numericCosts);
  };

  // Single Cost Remove button (sets single cost item to 0)
  const handleRemoveCost = (costKey) => {
    const currentCosts = customCosts || {
      seed_cost: data.cost_breakdown.seed_cost,
      fertilizer_cost: data.cost_breakdown.fertilizer_cost,
      labour_cost: data.cost_breakdown.labour_cost,
      irrigation_cost: data.cost_breakdown.irrigation_cost,
      machinery_cost: data.cost_breakdown.machinery_cost,
      other_cost: data.cost_breakdown.other_cost,
    };
    const updated = { ...currentCosts, [costKey]: 0 };
    setCustomCosts(updated);
    loadProfitAnalysis(selectedCrop, updated);
  };

  // Reset to original government benchmark values
  const handleResetCosts = () => {
    setCustomCosts(null);
    loadProfitAnalysis(selectedCrop, null);
  };

  if (!selectedFarm) {
    return (
      <div className="py-20 h-full flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="saas-card max-w-lg p-10 text-center flex flex-col items-center"
        >
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
            <MapPin className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-3xl font-extrabold mb-2 text-slate-900 dark:text-white">No Farm Selected</h2>
          <p className="text-slate-500 mb-6">Select a farm from the dashboard to run profit analysis.</p>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-20 h-full flex flex-col items-center justify-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full"></div>
          <IndianRupee className="w-16 h-16 text-amber-500 animate-bounce relative z-10" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Calculating Profit Economics...</h3>
        <p className="text-slate-500 font-medium">Evaluating harvest market prices, yield forecasts & CACP costs</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-20 max-w-4xl mx-auto px-4 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="saas-card p-10 text-center border-amber-200 dark:border-amber-900/50 relative overflow-hidden"
        >
          <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">Profit Analysis Unavailable</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">{error}</p>
          <button 
            onClick={() => loadProfitAnalysis(selectedCrop, customCosts)}
            className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30"
          >
            Retry Analysis
          </button>
        </motion.div>
      </div>
    );
  }

  const { farm_info, crop, expected_yield_total_quintals, predicted_market_price_3m, cost_source, cost_breakdown, financial_summary, scenarios, risk_analysis, final_recommendation } = data;

  const costItems = [
    { key: 'seed_cost', label: 'Seed Cost', val: cost_breakdown.seed_cost, unitVal: cost_breakdown.seed_cost_unit },
    { key: 'fertilizer_cost', label: 'Fertilizer Cost', val: cost_breakdown.fertilizer_cost, unitVal: cost_breakdown.fertilizer_cost_unit },
    { key: 'labour_cost', label: 'Labour Cost', val: cost_breakdown.labour_cost, unitVal: cost_breakdown.labour_cost_unit },
    { key: 'irrigation_cost', label: 'Irrigation Cost', val: cost_breakdown.irrigation_cost, unitVal: cost_breakdown.irrigation_cost_unit },
    { key: 'machinery_cost', label: 'Machinery Cost', val: cost_breakdown.machinery_cost, unitVal: cost_breakdown.machinery_cost_unit },
    { key: 'other_cost', label: 'Other Cost', val: cost_breakdown.other_cost, unitVal: cost_breakdown.other_cost_unit },
  ];

  return (
    <div className="py-8 max-w-[1400px] mx-auto px-4 sm:px-6 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2 flex items-center gap-3">
            <IndianRupee className="w-10 h-10 text-emerald-500" /> Profit Estimate
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
            Calculate how much money you can make
          </p>
        </div>

        {/* Crop Selector Component */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="relative">
            <select
              value={selectedCrop || crop}
              onChange={handleCropChange}
              className="w-full sm:w-64 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-sm border-2 border-primary/30 rounded-2xl px-4 py-3 pr-10 appearance-none cursor-pointer outline-none focus:border-primary shadow-sm"
            >
              <optgroup label="Recommended Crop">
                <option value={crop}>{crop} (Recommended)</option>
              </optgroup>
              <optgroup label="Select Custom Crop">
                {availableCrops.filter(c => c.toLowerCase() !== crop.toLowerCase()).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </optgroup>
            </select>
            <ChevronDown className="w-5 h-5 text-primary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button 
            onClick={() => loadProfitAnalysis(selectedCrop, customCosts)}
            className="px-4 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Recalculate
          </button>
        </div>
      </div>

      {/* Farm & Crop Context Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Farm Name</span>
          <span className="font-extrabold text-base text-slate-800 dark:text-white truncate block">{farm_info.farm_name}</span>
        </div>
        <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/30">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">Analyzed Crop</span>
          <span className="font-black text-lg text-emerald-600 dark:text-emerald-300 truncate block">{crop}</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">State & District</span>
          <span className="font-bold text-base text-slate-800 dark:text-white truncate block">{farm_info.state}, {farm_info.district}</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Farm Area</span>
          <span className="font-extrabold text-base text-slate-800 dark:text-white block">{farm_info.farm_area} {farm_info.farm_area_unit}</span>
        </div>
        <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/30">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">Expected Yield</span>
          <span className="font-black text-base text-blue-600 dark:text-blue-300 block">{expected_yield_total_quintals} Quintals</span>
        </div>
        <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/30">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1">Harvest Price (~3M)</span>
          <span className="font-black text-base text-amber-600 dark:text-amber-300 block">₹{predicted_market_price_3m.toLocaleString()}/Qtl</span>
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Investment */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="saas-card p-5 border-l-4 border-l-slate-500">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Investment</span>
          <p className="text-2xl font-black text-slate-800 dark:text-white">₹{financial_summary.total_investment.toLocaleString()}</p>
          <span className="text-[11px] text-slate-400 font-semibold mt-1 block">Input Costs</span>
        </motion.div>

        {/* Gross Income */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="saas-card p-5 border-l-4 border-l-blue-500">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-500 block mb-1">Gross Income</span>
          <p className="text-2xl font-black text-slate-800 dark:text-white">₹{financial_summary.gross_income.toLocaleString()}</p>
          <span className="text-[11px] text-slate-400 font-semibold mt-1 block">Harvest Value</span>
        </motion.div>

        {/* Net Profit */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`saas-card p-5 border-l-4 ${financial_summary.net_profit >= 0 ? 'border-l-emerald-500 bg-emerald-500/5' : 'border-l-rose-500 bg-rose-500/5'}`}>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">Net Profit</span>
          <p className={`text-2xl font-black ${financial_summary.net_profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
            ₹{financial_summary.net_profit.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 font-semibold mt-1 block">Gross − Investment</span>
        </motion.div>

        {/* ROI */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="saas-card p-5 border-l-4 border-l-teal-500">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 block mb-1">Return on Investment</span>
          <p className="text-2xl font-black text-teal-600 dark:text-teal-400">{financial_summary.roi}%</p>
          <span className="text-[11px] text-slate-400 font-semibold mt-1 block">ROI %</span>
        </motion.div>

        {/* Profit Margin */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="saas-card p-5 border-l-4 border-l-indigo-500">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 block mb-1">Profit Margin</span>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{financial_summary.profit_margin}%</p>
          <span className="text-[11px] text-slate-400 font-semibold mt-1 block">Margin %</span>
        </motion.div>

        {/* Break-even Price */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="saas-card p-5 border-l-4 border-l-amber-500">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-500 block mb-1">Break-even Price</span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400">₹{financial_summary.break_even_price.toLocaleString()}</p>
          <span className="text-[11px] text-slate-400 font-semibold mt-1 block">per Quintal</span>
        </motion.div>
      </div>

      {/* COST BREAKDOWN SECTION */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="saas-card p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-500" /> Cost Breakdown ({farm_info.farm_area} {farm_info.farm_area_unit})
            </h2>
            {/* Show Cost Source Badge */}
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold">
                Source: {cost_source.source_name}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                Updated: {cost_source.last_updated}
              </span>
              {cost_source.is_customized && (
                <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-300 text-xs font-extrabold">
                  Farmer Customized
                </span>
              )}
            </div>
          </div>

          {/* Customize Cost Buttons */}
          <div className="flex items-center gap-2">
            {cost_source.is_customized && (
              <button
                onClick={handleResetCosts}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
              </button>
            )}
            <button
              onClick={openCustomizeModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" /> Customize Costs
            </button>
          </div>
        </div>

        {/* Cost Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {costItems.map((item) => (
            <div key={item.key} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex flex-col justify-between group relative">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase block mb-1">{item.label}</span>
                <p className="text-xl font-black text-slate-800 dark:text-white">₹{Math.round(item.val).toLocaleString()}</p>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                  ₹{Math.round(item.unitVal)} / {farm_info.farm_area_unit}
                </span>
              </div>
              
              {/* Remove Cost Action Button */}
              {item.val > 0 && (
                <button
                  onClick={() => handleRemoveCost(item.key)}
                  title="Remove cost (set to ₹0 for family labour or own equipment)"
                  className="mt-3 text-[11px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" /> Remove (₹0)
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Total Cost Banner */}
        <div className="p-5 rounded-2xl bg-slate-900 text-white flex justify-between items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Total Cultivation Cost</span>
            <p className="text-3xl font-black text-emerald-400">₹{financial_summary.total_investment.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block font-semibold">Cost per {farm_info.farm_area_unit}</span>
            <p className="text-lg font-bold text-white">₹{Math.round(cost_breakdown.total_cost_unit).toLocaleString()} / {farm_info.farm_area_unit}</p>
          </div>
        </div>
      </motion.div>

      {/* BEST / AVERAGE / WORST CASE SCENARIOS */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="saas-card p-6 md:p-8">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-500" /> Scenario Simulations (Best / Average / Worst Case)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Worst Case */}
          <div className="p-6 rounded-3xl bg-rose-500/5 border border-rose-500/20 space-y-4">
            <div className="flex justify-between items-center">
              <span className="px-3 py-1 bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-full text-xs font-extrabold">Worst Case</span>
              <span className="text-xs text-rose-500 font-bold">-15% Yield, -10% Price</span>
            </div>
            <div>
              <p className="text-3xl font-black text-rose-600 dark:text-rose-400">₹{scenarios.worst_case.net_profit.toLocaleString()}</p>
              <p className="text-xs font-bold text-slate-400 uppercase mt-1">Expected Net Profit</p>
            </div>
            <div className="space-y-1.5 border-t border-rose-500/20 pt-3 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <div className="flex justify-between"><span>Yield:</span><strong>{scenarios.worst_case.yield_quintal} Qtl</strong></div>
              <div className="flex justify-between"><span>Selling Price:</span><strong>₹{scenarios.worst_case.market_price}/Qtl</strong></div>
              <div className="flex justify-between"><span>Gross Income:</span><strong>₹{scenarios.worst_case.gross_income.toLocaleString()}</strong></div>
              <div className="flex justify-between"><span>ROI:</span><strong className={scenarios.worst_case.roi >= 0 ? 'text-emerald-500' : 'text-rose-500'}>{scenarios.worst_case.roi}%</strong></div>
            </div>
          </div>

          {/* Average Case */}
          <div className="p-6 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/40 shadow-lg shadow-emerald-500/5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-xs font-black">Average Case (Base)</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">ML Projected</span>
            </div>
            <div>
              <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400">₹{scenarios.average_case.net_profit.toLocaleString()}</p>
              <p className="text-xs font-bold text-slate-400 uppercase mt-1">Expected Net Profit</p>
            </div>
            <div className="space-y-1.5 border-t border-emerald-500/30 pt-3 text-xs text-slate-700 dark:text-slate-200 font-medium">
              <div className="flex justify-between"><span>Yield:</span><strong>{scenarios.average_case.yield_quintal} Qtl</strong></div>
              <div className="flex justify-between"><span>Selling Price:</span><strong>₹{scenarios.average_case.market_price}/Qtl</strong></div>
              <div className="flex justify-between"><span>Gross Income:</span><strong>₹{scenarios.average_case.gross_income.toLocaleString()}</strong></div>
              <div className="flex justify-between"><span>ROI:</span><strong className="text-emerald-500 font-bold">{scenarios.average_case.roi}%</strong></div>
            </div>
          </div>

          {/* Best Case */}
          <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/20 space-y-4">
            <div className="flex justify-between items-center">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-extrabold">Best Case</span>
              <span className="text-xs text-blue-500 font-bold">+15% Yield, +10% Price</span>
            </div>
            <div>
              <p className="text-3xl font-black text-blue-600 dark:text-blue-400">₹{scenarios.best_case.net_profit.toLocaleString()}</p>
              <p className="text-xs font-bold text-slate-400 uppercase mt-1">Expected Net Profit</p>
            </div>
            <div className="space-y-1.5 border-t border-blue-500/20 pt-3 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <div className="flex justify-between"><span>Yield:</span><strong>{scenarios.best_case.yield_quintal} Qtl</strong></div>
              <div className="flex justify-between"><span>Selling Price:</span><strong>₹{scenarios.best_case.market_price}/Qtl</strong></div>
              <div className="flex justify-between"><span>Gross Income:</span><strong>₹{scenarios.best_case.gross_income.toLocaleString()}</strong></div>
              <div className="flex justify-between"><span>ROI:</span><strong className="text-emerald-500 font-bold">{scenarios.best_case.roi}%</strong></div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* RISK ANALYSIS & FINAL SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Risk Analysis */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="md:col-span-5 saas-card p-6 md:p-8 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-500" /> Risk Assessment
              </h2>
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                risk_analysis.level === 'Low' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                risk_analysis.level === 'Medium' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-rose-500/20 text-rose-600'
              }`}>
                {risk_analysis.level} Risk
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">{risk_analysis.description}</p>
            
            <div className="space-y-2">
              {risk_analysis.factors.map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Final Recommendation Banner */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="md:col-span-7 rounded-[2.5rem] p-8 bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white shadow-2xl flex flex-col justify-between relative overflow-hidden border border-white/10">
          <div className="relative z-10 space-y-4">
            <span className="px-3.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Executive Financial Recommendation
            </span>
            <p className="text-lg font-medium leading-relaxed text-slate-200">
              {final_recommendation}
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap justify-between items-center gap-3 relative z-10 text-xs text-slate-400 font-medium">
            <span>Powered by AgriNova Profit Engine & CACP Benchmarks</span>
            <Link to="/market-intelligence" className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1">
              Explore APMC Market Forecast <BarChart3 className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* CUSTOMIZE COST MODAL */}
      <AnimatePresence>
        {isCustomizeOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 md:p-8 space-y-6"
            >
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-emerald-500" /> Customize Cultivation Costs
                </h3>
                <button onClick={() => setIsCustomizeOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">×</button>
              </div>

              <p className="text-xs text-slate-500">
                Adjust input costs for your entire {farm_info.farm_area} {farm_info.farm_area_unit} farm. Enter ₹0 if you use family labour or own equipment.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Seed Cost (₹)</label>
                  <input
                    type="number"
                    value={editCosts.seed_cost}
                    onChange={(e) => setEditCosts({...editCosts, seed_cost: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-emerald-500 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Fertilizer Cost (₹)</label>
                  <input
                    type="number"
                    value={editCosts.fertilizer_cost}
                    onChange={(e) => setEditCosts({...editCosts, fertilizer_cost: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-emerald-500 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Labour Cost (₹)</label>
                  <input
                    type="number"
                    value={editCosts.labour_cost}
                    onChange={(e) => setEditCosts({...editCosts, labour_cost: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-emerald-500 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Irrigation Cost (₹)</label>
                  <input
                    type="number"
                    value={editCosts.irrigation_cost}
                    onChange={(e) => setEditCosts({...editCosts, irrigation_cost: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-emerald-500 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Machinery Cost (₹)</label>
                  <input
                    type="number"
                    value={editCosts.machinery_cost}
                    onChange={(e) => setEditCosts({...editCosts, machinery_cost: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-emerald-500 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Other Cost (₹)</label>
                  <input
                    type="number"
                    value={editCosts.other_cost}
                    onChange={(e) => setEditCosts({...editCosts, other_cost: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-emerald-500 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setIsCustomizeOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={applyCustomCosts}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20"
                >
                  Apply & Recalculate
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ProfitAnalysis;
