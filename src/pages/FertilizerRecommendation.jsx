import React, { useState, useEffect, useContext } from 'react';
import { FarmContext } from '../context/farm-context';
import { recommendFertilizerApi, fetchFertilizerHistoryApi, fetchFertilizerMasterApi } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical, Sparkles, CheckCircle2, AlertTriangle, ShieldAlert, CloudSun,
  Calendar, IndianRupee, ArrowRight, RefreshCw, FileText, ChevronRight, TestTube,
  Info, Leaf, Scale, Clock, Layers, History, BookOpen, AlertCircle, Zap, Target,
  Award, TrendingUp, Check, Filter, Search, ShoppingBag, Droplets, Thermometer,
  ShieldCheck, Sprout, ArrowUpRight
} from 'lucide-react';

const PREVIOUS_CROP_OPTIONS = [
  { value: '', label: 'None / Fallow' },
  { value: 'Chickpea', label: 'Chickpea / Gram (Legume - N Credit)' },
  { value: 'Moong', label: 'Moong / Green Gram (Legume - N Credit)' },
  { value: 'Urad', label: 'Urad / Black Gram (Legume - N Credit)' },
  { value: 'Soybean', label: 'Soybean (Legume - N Credit)' },
  { value: 'Groundnut', label: 'Groundnut / Peanut (Legume - N Credit)' },
  { value: 'Pigeonpea', label: 'Arhar / Tur (Legume - N Credit)' },
  { value: 'Sugarcane', label: 'Sugarcane (Heavy Feeder)' },
  { value: 'Cotton', label: 'Cotton (Heavy Feeder)' },
  { value: 'Paddy', label: 'Paddy / Rice (Heavy Feeder)' },
  { value: 'Maize', label: 'Maize / Corn (Heavy Feeder)' },
];

const SOIL_TYPES = ['Loamy', 'Black', 'Red', 'Alluvial', 'Sandy', 'Clay', 'Laterite'];
const CROPS = ['Wheat', 'Rice', 'Maize', 'Cotton', 'Sugarcane', 'Potato', 'Chickpea', 'Mustard', 'Soybean', 'Groundnut', 'Tomato', 'Onion', 'Chilli'];
const STATES = ['Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh', 'Maharashtra', 'Gujarat', 'Rajasthan', 'Karnataka', 'Tamil Nadu', 'Andhra Pradesh', 'Bihar'];
const SEASONS = ['Kharif', 'Rabi', 'Zaid / Summer'];

const FertilizerRecommendation = () => {
  const { selectedFarm, farms } = useContext(FarmContext);
  
  // Input Selection Mode: 'farm' or 'custom'
  const [inputMode, setInputMode] = useState('farm');
  const [activeFarmId, setActiveFarmId] = useState(selectedFarm?.id || (farms?.[0]?.id || ''));
  const [previousCrop, setPreviousCrop] = useState('');
  const [forceSmartMode, setForceSmartMode] = useState(false);

  // Custom Form Fields
  const [customForm, setCustomForm] = useState({
    crop: 'Wheat',
    soil_type: 'Loamy',
    state: 'Punjab',
    season: 'Kharif',
    farm_area: '1.0',
    previous_crop: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    ph: ''
  });

  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [selectedSolutionIndex, setSelectedSolutionIndex] = useState(0);
  const [history, setHistory] = useState([]);
  const [masterCatalog, setMasterCatalog] = useState([]);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [activeTab, setActiveTab] = useState('recommendation'); // 'recommendation' | 'history' | 'catalog'
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (selectedFarm?.id) {
      setActiveFarmId(selectedFarm.id);
    }
  }, [selectedFarm]);

  useEffect(() => {
    if (activeFarmId && inputMode === 'farm') {
      loadHistory(activeFarmId);
    }
    loadMasterCatalog();
  }, [activeFarmId, inputMode]);

  const loadHistory = async (fId) => {
    try {
      const res = await fetchFertilizerHistoryApi(fId);
      if (res?.success) {
        setHistory(res.data || []);
      }
    } catch (err) {
      console.warn("Failed to load fertilizer history:", err);
    }
  };

  const loadMasterCatalog = async () => {
    try {
      const res = await fetchFertilizerMasterApi();
      if (res?.success) {
        setMasterCatalog(res.data || []);
      }
    } catch (err) {
      console.warn("Failed to load fertilizer catalog:", err);
    }
  };

  const currentFarmObj = farms?.find(f => f.id === Number(activeFarmId)) || selectedFarm;
  const isFarmSoilPresent = Boolean(
    currentFarmObj?.nitrogen !== null && currentFarmObj?.nitrogen !== undefined && Number(currentFarmObj?.nitrogen) > 0 &&
    currentFarmObj?.phosphorus !== null && currentFarmObj?.phosphorus !== undefined && Number(currentFarmObj?.phosphorus) > 0 &&
    currentFarmObj?.potassium !== null && currentFarmObj?.potassium !== undefined && Number(currentFarmObj?.potassium) > 0
  );

  const isCustomSoilPresent = Boolean(
    customForm.nitrogen && customForm.phosphorus && customForm.potassium &&
    Number(customForm.nitrogen) > 0 && Number(customForm.phosphorus) > 0 && Number(customForm.potassium) > 0
  );

  const isSoilDataActive = inputMode === 'farm' ? isFarmSoilPresent : isCustomSoilPresent;

  const handleGenerateRecommendation = async () => {
    setErrorMsg('');
    setLoading(true);
    setRecommendation(null);
    setSelectedSolutionIndex(0);

    try {
      let payload = {};
      if (inputMode === 'farm') {
        if (!activeFarmId) {
          setErrorMsg("Please select a farm first.");
          setLoading(false);
          return;
        }
        payload = {
          farm_id: Number(activeFarmId),
          previous_crop: previousCrop
        };
      } else {
        payload = {
          crop: customForm.crop,
          soil_type: customForm.soil_type,
          state: customForm.state,
          season: customForm.season,
          farm_area: Number(customForm.farm_area || 1.0),
          previous_crop: customForm.previous_crop,
          nitrogen: customForm.nitrogen ? Number(customForm.nitrogen) : null,
          phosphorus: customForm.phosphorus ? Number(customForm.phosphorus) : null,
          potassium: customForm.potassium ? Number(customForm.potassium) : null,
          ph: customForm.ph ? Number(customForm.ph) : null
        };
      }

      const res = await recommendFertilizerApi(payload);
      if (res?.success) {
        setRecommendation(res.data);
        if (inputMode === 'farm') {
          loadHistory(activeFarmId);
        }
      } else {
        setErrorMsg(res?.message || "Failed to generate recommendation.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Error generating smart fertilizer recommendation.");
    } finally {
      setLoading(false);
    }
  };

  const activeSolution = recommendation?.top_3_options?.[selectedSolutionIndex] || recommendation?.primary_recommendation;
  const activeSchedule = activeSolution?.application_schedule || recommendation?.application_schedule;

  const filteredCatalog = masterCatalog.filter(f =>
    f.name?.toLowerCase().includes(catalogSearch.toLowerCase()) ||
    f.type?.toLowerCase().includes(catalogSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 font-sans text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      
      {/* CREATIVE HERO HEADER CARD */}
      <div className="relative bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-10 border border-emerald-500/20 shadow-2xl overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              AgriNova Hybrid AI Engine v2.4
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Smart Fertilizer <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Optimizer</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl font-medium leading-relaxed">
              Precision NPK deficiency solver & agronomic rule engine. Supports Soil Health Cards and Smart Estimator for cards-free farms.
            </p>
          </div>

          {/* CREATIVE TAB SWITCHER */}
          <div className="flex bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-md">
            <button
              onClick={() => setActiveTab('recommendation')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                activeTab === 'recommendation'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/25 scale-[1.02]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <FlaskConical className="w-4 h-4" /> Optimizer Plan
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/25 scale-[1.02]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <History className="w-4 h-4" /> History Log
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                activeTab === 'catalog'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/25 scale-[1.02]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" /> Master Catalog
            </button>
          </div>
        </div>
      </div>

      {/* ERROR DISPLAY ALERT */}
      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-400 flex items-center gap-3 backdrop-blur-md"
        >
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <p className="text-sm font-medium">{errorMsg}</p>
        </motion.div>
      )}

      {/* TAB 1: RECOMMENDATION OPTIMIZER */}
      {activeTab === 'recommendation' && (
        <div className="space-y-8">
          
          {/* TOP SECTION: CONFIG & INPUTS (Full Width) */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/80 pb-5">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-emerald-400" /> Recommendation Parameters & Field Inputs
                </h2>
                <p className="text-xs text-slate-400 mt-1">Select a registered farm or enter custom soil/crop metrics below.</p>
              </div>

              {/* Input Mode Selector */}
              <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setInputMode('farm')}
                  className={`px-5 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
                    inputMode === 'farm'
                      ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🌱 Registered Farm
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('custom')}
                  className={`px-5 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
                    inputMode === 'custom'
                      ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ⚡ Custom Entry
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* DYNAMIC MODE STATUS BADGE CARD (4 Cols) */}
              <div className={`md:col-span-4 p-5 rounded-2xl border transition-all duration-300 h-full flex flex-col justify-between ${
                isSoilDataActive
                  ? 'bg-gradient-to-br from-emerald-950/60 to-slate-900 border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/5'
                  : 'bg-gradient-to-br from-amber-950/60 to-slate-900 border-amber-500/40 text-amber-400 shadow-lg shadow-amber-500/5'
              }`}>
                <div>
                  <div className="flex items-center gap-2.5 font-bold text-sm">
                    {isSoilDataActive ? (
                      <>
                        <Target className="w-5 h-5 text-emerald-400 shrink-0" />
                        <span>🎯 Mode 1: Precision Mode</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 text-amber-400 shrink-0" />
                        <span>⚡ Mode 2: Smart Mode</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                    {isSoilDataActive
                      ? 'Soil Health Card NPK values detected. Engine calculates exact field nutrient deficiency (90–98% accuracy).'
                      : 'No Soil Card values added during Add Farm. Smart AI automatically estimates nutrients using crop requirements & regional agronomics (75–90% accuracy).'
                    }
                  </p>
                </div>
              </div>

              {/* INPUT FIELDS AREA (8 Cols) */}
              <div className="md:col-span-8 space-y-4">
                {/* FARM SELECTION MODE */}
                {inputMode === 'farm' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        Choose Registered Farm
                      </label>
                      <select
                        value={activeFarmId}
                        onChange={(e) => setActiveFarmId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition shadow-inner"
                      >
                        <option value="">Select a farm...</option>
                        {farms?.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.farm_name} ({f.current_crop || f.crop || 'Wheat'} • {f.farm_area || f.area_acres || 1.0} Acres)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        Preceding / Previous Crop
                      </label>
                      <select
                        value={previousCrop}
                        onChange={(e) => setPreviousCrop(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition"
                      >
                        {PREVIOUS_CROP_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    {currentFarmObj && (
                      <div className="sm:col-span-2 bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80 flex flex-wrap justify-between items-center gap-4 text-xs text-slate-300 shadow-inner">
                        <div>
                          <span className="text-slate-500">Selected Crop: </span>
                          <span className="font-bold text-emerald-400">{currentFarmObj.current_crop || currentFarmObj.crop || 'Wheat'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Soil Type: </span>
                          <span className="font-semibold text-slate-200">{currentFarmObj.soil_type || 'Loamy'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Area: </span>
                          <span className="font-semibold text-slate-200">{currentFarmObj.farm_area || currentFarmObj.area_acres || 1.0} Acres</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Status: </span>
                          <span className={`font-bold ${isFarmSoilPresent && !forceSmartMode ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {isFarmSoilPresent && !forceSmartMode ? 'Present (N, P, K)' : 'Missing / Smart Mode'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* CUSTOM FIELD INPUT MODE */}
                {inputMode === 'custom' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Crop</label>
                        <select
                          value={customForm.crop}
                          onChange={(e) => setCustomForm({ ...customForm, crop: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                        >
                          {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Soil Type</label>
                        <select
                          value={customForm.soil_type}
                          onChange={(e) => setCustomForm({ ...customForm, soil_type: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                        >
                          {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">State</label>
                        <select
                          value={customForm.state}
                          onChange={(e) => setCustomForm({ ...customForm, state: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                        >
                          {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Area (Acres)</label>
                        <input
                          type="number"
                          step="0.5"
                          min="0.1"
                          value={customForm.farm_area}
                          onChange={(e) => setCustomForm({ ...customForm, farm_area: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Previous Crop</label>
                      <select
                        value={customForm.previous_crop}
                        onChange={(e) => setCustomForm({ ...customForm, previous_crop: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                      >
                        {PREVIOUS_CROP_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>

                    {/* Optional Soil NPK */}
                    <div className="border-t border-slate-800/80 pt-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-300">Soil Health NPK (Optional)</span>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20">Mode 1 Trigger</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">N (kg/ha)</label>
                          <input
                            type="number"
                            placeholder="e.g. 45"
                            value={customForm.nitrogen}
                            onChange={(e) => setCustomForm({ ...customForm, nitrogen: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">P (kg/ha)</label>
                          <input
                            type="number"
                            placeholder="e.g. 20"
                            value={customForm.phosphorus}
                            onChange={(e) => setCustomForm({ ...customForm, phosphorus: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">K (kg/ha)</label>
                          <input
                            type="number"
                            placeholder="e.g. 30"
                            value={customForm.potassium}
                            onChange={(e) => setCustomForm({ ...customForm, potassium: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Submit Button (Full Width) */}
            <button
              onClick={handleGenerateRecommendation}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 text-slate-950 font-black text-base hover:from-emerald-300 hover:to-teal-300 transition-all duration-300 shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2.5 disabled:opacity-50 hover:scale-[1.005]"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Analyzing Agronomic Datasets...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate AI Recommendation</span>
                </>
              )}
            </button>

          </div>

          {/* BOTTOM SECTION: DASHBOARD RESULTS (Full Width Below) */}
          <div className="space-y-6">
            {!recommendation && !loading && (
              <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 min-h-[320px] backdrop-blur-xl">
                <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
                  <FlaskConical className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-200">No Plan Generated Yet</h3>
                <p className="text-slate-400 text-sm max-w-md leading-relaxed">
                  Select a farm or enter field parameters above and click "Generate AI Recommendation" to receive your complete fertilizer plan.
                </p>
              </div>
            )}

            {loading && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 min-h-[320px] backdrop-blur-xl">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
                  <Sparkles className="w-6 h-6 text-emerald-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-slate-300 text-sm font-bold">Running Multi-Factor Optimizer & Agronomic Dataset Solver...</p>
              </div>
            )}

            {recommendation && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                
                {/* MODE & CONFIDENCE HERO BANNER */}
                <div className="relative bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/80 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-2xl overflow-hidden backdrop-blur-xl">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30">
                      {recommendation.mode === 'PRECISION' ? <Target className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
                      {recommendation.mode_badge}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      Optimal Plan for {recommendation.crop} ({recommendation.farm_area_acres} Acres)
                    </h2>
                    <p className="text-xs text-slate-400 font-medium">
                      Baseline: {recommendation.soil_nutrients_kg_ha?.baseline_source || 'Soil Health Data'}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 bg-slate-950/80 px-5 py-3 rounded-2xl border border-slate-800 shadow-xl">
                    <Award className="w-8 h-8 text-amber-400 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Confidence Score</div>
                      <div className="text-2xl font-black text-emerald-400">{recommendation.confidence_score}%</div>
                    </div>
                  </div>
                </div>

                {/* PREVIOUS CROP CREDIT ALERT */}
                {recommendation.previous_crop_adjustment?.credit_type === 'LEGUME_N_FIXATION_CREDIT' && (
                  <div className="bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/40 rounded-2xl p-4 flex items-center gap-3 text-emerald-300 text-xs shadow-lg">
                    <Leaf className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold text-emerald-400">Legume Nitrogen Credit Applied! </span>
                      {recommendation.previous_crop_adjustment.explanation}
                    </div>
                  </div>
                )}

                {/* TOP 3 COMBINATION SOLUTIONS TABS */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                      Recommended Formulations (Top Ranked Blends)
                    </h3>
                    <span className="text-[10px] text-slate-500">Click to compare options</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {recommendation.top_3_options?.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedSolutionIndex(idx)}
                        className={`p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden ${
                          selectedSolutionIndex === idx
                            ? 'bg-gradient-to-b from-emerald-950/80 to-slate-900 border-emerald-500 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500 scale-[1.02]'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 uppercase tracking-wider">
                            {opt.tag || `Option ${idx + 1}`}
                          </span>
                          <span className="text-xs font-bold text-slate-300">{opt.confidence_score}%</span>
                        </div>
                        <h4 className="text-xs font-bold text-white line-clamp-1">{opt.title}</h4>
                        <div className="text-xs font-black text-emerald-400 mt-2 flex items-baseline gap-1">
                          ₹{opt.total_cost_inr} <span className="text-[10px] font-normal text-slate-400">(₹{opt.cost_per_acre_inr}/acre)</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ACTIVE SOLUTION METRICS BREAKDOWN CARDS */}
                {activeSolution && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
                      <div className="flex items-center gap-2 text-slate-400 text-xs mb-1 font-semibold">
                        <IndianRupee className="w-4 h-4 text-emerald-400" /> Total Cost
                      </div>
                      <div className="text-2xl font-black text-emerald-400">₹{activeSolution.total_cost_inr}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">₹{activeSolution.cost_per_acre_inr} / acre</div>
                    </div>

                    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
                      <div className="flex items-center gap-2 text-slate-400 text-xs mb-1 font-semibold">
                        <ShoppingBag className="w-4 h-4 text-teal-400" /> Total Bags
                      </div>
                      <div className="text-2xl font-black text-white">
                        {activeSolution.items?.reduce((acc, i) => acc + i.total_bags, 0)} Bags
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Standard 45kg/50kg</div>
                    </div>

                    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
                      <div className="flex items-center gap-2 text-slate-400 text-xs mb-1 font-semibold">
                        <Scale className="w-4 h-4 text-blue-400" /> Total Weight
                      </div>
                      <div className="text-2xl font-black text-white">
                        {activeSolution.items?.reduce((acc, i) => acc + i.total_quantity_kg, 0).toFixed(1)} kg
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">For {recommendation.farm_area_acres} Acres</div>
                    </div>

                    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
                      <div className="flex items-center gap-2 text-slate-400 text-xs mb-1 font-semibold">
                        <TrendingUp className="w-4 h-4 text-amber-400" /> Yield Boost
                      </div>
                      <div className="text-2xl font-black text-amber-400">+{recommendation.expected_yield_improvement}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Estimated Yield Gain</div>
                    </div>
                  </div>
                )}

                {/* FORMULATION DOSAGE BREAKDOWN TABLE */}
                {activeSolution && (
                  <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl backdrop-blur-xl">
                    <h3 className="text-sm font-extrabold text-slate-200 flex items-center gap-2">
                      <FlaskConical className="w-4 h-4 text-emerald-400" />
                      Formulation Dosage Breakdown ({activeSolution.title})
                    </h3>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-800">
                          <tr>
                            <th className="p-3">Fertilizer Name</th>
                            <th className="p-3">Dose / Acre</th>
                            <th className="p-3">Total Qty</th>
                            <th className="p-3">Bags Needed</th>
                            <th className="p-3">Est. Cost</th>
                            <th className="p-3">Application Method</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {activeSolution.items?.map((item, i) => (
                            <tr key={i} className="hover:bg-slate-800/40 transition">
                              <td className="p-3 font-bold text-white flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                {item.fertilizer_name}
                              </td>
                              <td className="p-3 text-emerald-400 font-extrabold">{item.dose_per_acre_kg} kg</td>
                              <td className="p-3 font-semibold">{item.total_quantity_kg} kg</td>
                              <td className="p-3 font-bold text-amber-400">{item.total_bags} bags ({item.bag_size_kg}kg)</td>
                              <td className="p-3 font-extrabold text-slate-100">₹{item.item_cost_inr}</td>
                              <td className="p-3 text-slate-400">{item.application_method}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TIMELINE APPLICATION SCHEDULE */}
                {activeSchedule && (
                  <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl backdrop-blur-xl">
                    <h3 className="text-sm font-extrabold text-slate-200 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-teal-400" /> Stage-wise Split Application Schedule
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
                      {activeSchedule.map((stg, i) => (
                        <div key={i} className="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between shadow-inner relative overflow-hidden">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">{stg.stage_name}</span>
                              <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full font-semibold">{stg.recommended_timing}</span>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-relaxed font-medium">{stg.application_instructions}</p>
                          </div>

                          <div className="border-t border-slate-800/80 pt-3 space-y-2 mt-2">
                            {stg.fertilizer_split && stg.fertilizer_split.length > 0 ? (
                              stg.fertilizer_split.map((spl, j) => (
                                <div key={j} className="flex justify-between items-center text-[11px] bg-slate-900/60 p-2 rounded-xl border border-slate-800/60">
                                  <span className="text-slate-300 font-semibold">{spl.fertilizer_name}:</span>
                                  <span className="font-extrabold text-emerald-400">{spl.stage_dose_per_acre_kg} kg/acre</span>
                                </div>
                              ))
                            ) : (
                              <div className="text-[11px] text-emerald-400/90 font-semibold italic flex items-center gap-1.5 pt-1">
                                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>No top-dressing required for this stage. Full dose covered in basal application.</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* WEATHER ADVISORY & SAFETY PRECAUTIONS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recommendation.weather_advice && recommendation.weather_advice.length > 0 && (
                    <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl backdrop-blur-xl">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                          <CloudSun className="w-4 h-4" /> Live Weather Intelligence Advisory
                        </h3>
                        {recommendation.weather_summary && (
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300">
                            <span className="bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                              🌡️ {recommendation.weather_summary.temperature_c}°C
                            </span>
                            <span className="bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                              💧 {recommendation.weather_summary.humidity_pct}%
                            </span>
                            <span className="bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                              🌧️ {recommendation.weather_summary.rainfall_mm} mm
                            </span>
                          </div>
                        )}
                      </div>

                      <ul className="space-y-2 text-xs text-slate-300">
                        {recommendation.weather_advice.map((adv, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{adv}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {recommendation.precautions && recommendation.precautions.length > 0 && (
                    <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl backdrop-blur-xl">
                      <h3 className="text-xs font-extrabold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4" /> Soil & Field Handling Precautions
                      </h3>
                      <ul className="space-y-2 text-xs text-slate-300">
                        {recommendation.precautions.map((prc, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                            <span>{prc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* DEEP AI EXPLANATION */}
                {recommendation.ai_explanation && (
                  <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/60 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl backdrop-blur-xl">
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-emerald-400" /> AI Agronomic Explanation
                    </h3>
                    
                    <div className="space-y-3 text-xs text-slate-300 leading-relaxed font-medium">
                      <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-1">
                        <span className="text-emerald-400 font-extrabold uppercase text-[10px] tracking-wider block">Nutrient Gap Analysis</span>
                        <p>{recommendation.ai_explanation.nutrient_gap_analysis}</p>
                      </div>
                      <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-1">
                        <span className="text-teal-400 font-extrabold uppercase text-[10px] tracking-wider block">Fertilizer Combination Logic</span>
                        <p>{recommendation.ai_explanation.fertilizer_matching_logic}</p>
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-xl">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" /> Recommendation History Log
          </h2>

          {history.length === 0 ? (
            <p className="text-slate-400 text-sm py-12 text-center">No past recommendations found for this farm.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Farm</th>
                    <th className="p-3.5">Crop</th>
                    <th className="p-3.5">Mode</th>
                    <th className="p-3.5">Recommended Fertilizer</th>
                    <th className="p-3.5">Total Qty</th>
                    <th className="p-3.5">Est. Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {history.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 text-slate-400">{new Date(rec.created_at).toLocaleDateString()}</td>
                      <td className="p-3.5 font-bold text-white">{rec.farm_name}</td>
                      <td className="p-3.5 text-emerald-400 font-extrabold">{rec.crop}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          rec.recommendation_type === 'SOIL_BASED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {rec.recommendation_type === 'SOIL_BASED' ? 'Precision' : 'Smart'}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold">{rec.recommended_fertilizer}</td>
                      <td className="p-3.5 font-semibold">{rec.total_quantity_kg} kg</td>
                      <td className="p-3.5 font-black text-emerald-400">₹{rec.estimated_cost_inr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CATALOG */}
      {activeTab === 'catalog' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" /> Fertilizer Reference Catalog
            </h2>

            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search fertilizer name or type..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 shadow-inner"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCatalog.map((item, idx) => (
              <div key={idx} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-emerald-500/40 transition shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-extrabold text-white">{item.name}</h4>
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full font-semibold">{item.type}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black text-emerald-400">₹{item.price_per_kg}/kg</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-900/90 p-3 rounded-xl text-center text-xs border border-slate-800/80">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">N%</div>
                    <div className="font-extrabold text-emerald-400">{item.N_pct}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">P%</div>
                    <div className="font-extrabold text-teal-400">{item.P_pct}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">K%</div>
                    <div className="font-extrabold text-blue-400">{item.K_pct}%</div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  <strong className="text-slate-300 font-bold">Method:</strong> {item.application_method}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default FertilizerRecommendation;
