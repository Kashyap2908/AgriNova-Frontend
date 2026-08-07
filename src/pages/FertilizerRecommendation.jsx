import React, { useState, useEffect, useContext, useRef } from 'react';
import { FarmContext } from '../context/farm-context';
import { recommendFertilizerApi, fetchFertilizerHistoryApi, fetchFertilizerMasterApi, fetchCropsApi } from '../services/api';
import { generatePlanPDF } from '../utils/pdfGenerator';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical, Sparkles, CheckCircle2, AlertTriangle, ShieldAlert, CloudSun,
  Calendar, IndianRupee, ArrowRight, RefreshCw, FileText, ChevronRight, TestTube,
  Info, Leaf, Scale, Clock, Layers, History, BookOpen, AlertCircle, Zap, Target,
  Award, TrendingUp, Check, Filter, Search, ShoppingBag, Droplets, Thermometer,
  ShieldCheck, Sprout, ArrowUpRight, DollarSign, Bug, Shield, Compass, Sun, Wind, Download,
  Layers3, HelpCircle, ChevronDown, CheckCheck
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

const DEFAULT_CROPS_LIST = [
  'Apple', 'Banana', 'Bajra', 'Black Gram (Urad)', 'Black Pepper', 'Bottle Gourd', 
  'Brinjal', 'Cabbage', 'Cardamom', 'Castor', 'Cauliflower', 'Chickpea', 'Chilli', 
  'Citrus', 'Coffee', 'Coriander', 'Cotton', 'Cucumber', 'Cumin', 'Fennel', 'Fenugreek', 
  'Garlic', 'Ginger', 'Gram', 'Grapes', 'Green Gram (Moong)', 'Groundnut', 'Guava', 
  'Jowar', 'Lentil (Masoor)', 'Maize', 'Mango', 'Muskmelon', 'Mustard', 'Okra', 
  'Onion', 'Papaya', 'Pea', 'Pomegranate', 'Potato', 'Pumpkin', 'Ragi', 'Rice', 
  'Sesame', 'Soybean', 'Sugarcane', 'Sunflower', 'Tea', 'Tomato', 'Tur (Pigeonpea)', 
  'Turmeric', 'Watermelon', 'Wheat'
];

const SEASONS = ['Kharif', 'Rabi', 'Zaid / Summer', 'All Season'];

const FertilizerRecommendation = () => {
  const { selectedFarm, farms } = useContext(FarmContext);

  const [activeFarmId, setActiveFarmId] = useState(selectedFarm?.id || (farms?.[0]?.id || ''));
  const [selectedCrop, setSelectedCrop] = useState('Wheat');
  const [previousCrop, setPreviousCrop] = useState('');
  const [season, setSeason] = useState('Kharif');

  // Searchable Crop List state
  const [cropsList, setCropsList] = useState(DEFAULT_CROPS_LIST);
  const [cropSearch, setCropSearch] = useState('');
  const [isCropDropdownOpen, setIsCropDropdownOpen] = useState(false);
  const cropDropdownRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const [history, setHistory] = useState([]);
  const [masterCatalog, setMasterCatalog] = useState([]);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [activeTab, setActiveTab] = useState('planner'); // 'planner' | 'history' | 'catalog'
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (selectedFarm?.id) {
      setActiveFarmId(selectedFarm.id);
    }
  }, [selectedFarm]);

  useEffect(() => {
    loadCrops();
    loadMasterCatalog();
  }, []);

  useEffect(() => {
    if (activeFarmId) {
      loadHistory(activeFarmId);
    }
  }, [activeFarmId]);

  // Click outside listener for searchable crop dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cropDropdownRef.current && !cropDropdownRef.current.contains(event.target)) {
        setIsCropDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadCrops = async () => {
    try {
      const res = await fetchCropsApi();
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        setCropsList(res.data);
      }
    } catch (err) {
      console.warn("Using default crops list:", err);
    }
  };

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

  const handleGeneratePlan = async () => {
    if (!activeFarmId) {
      setErrorMsg("Please select a registered farm.");
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const payload = {
        farm_id: activeFarmId,
        crop: selectedCrop,
        previous_crop: previousCrop,
        season: season,
      };

      const response = await recommendFertilizerApi(payload);

      if (response?.success && response?.data) {
        setPlan(response.data);
        setSelectedPlanIndex(0);
        if (activeFarmId) {
          loadHistory(activeFarmId);
        }
      } else {
        setErrorMsg(response?.message || "Failed to generate nutrition & protection plan.");
      }
    } catch (err) {
      console.error("Plan generation error:", err);
      setErrorMsg(err.response?.data?.message || "Network or server error while generating plan.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!plan) return;
    generatePlanPDF(plan);
  };

  const filteredCrops = cropsList.filter(c =>
    c.toLowerCase().includes(cropSearch.toLowerCase())
  );

  const filteredCatalog = masterCatalog.filter(item => {
    if (!catalogSearch) return true;
    const q = catalogSearch.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q) ||
      item.brand.toLowerCase().includes(q) ||
      item.suitable_crops.toLowerCase().includes(q)
    );
  });

  const activeSelectedPlan = plan?.top_fertilizer_plans?.[selectedPlanIndex] || plan?.top_fertilizer_plans?.[0] || {};

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-cyan-950 border border-emerald-500/20 p-6 md:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Next-Gen Crop Protection & Nutrition System
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Smart Crop Nutrition & Protection Planner
              </h1>
              <p className="text-slate-400 mt-2 max-w-2xl text-sm md:text-base">
                Production-ready agricultural recommendation engine powered by verified ICAR/KVK agronomic standards, dynamic linear programming, real-time weather cache, and present-day market prices.
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
              <button
                onClick={() => setActiveTab('planner')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs md:text-sm transition-all ${
                  activeTab === 'planner'
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FlaskConical className="w-4 h-4" /> Planner
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs md:text-sm transition-all ${
                  activeTab === 'history'
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <History className="w-4 h-4" /> History
              </button>
              <button
                onClick={() => setActiveTab('catalog')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs md:text-sm transition-all ${
                  activeTab === 'catalog'
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" /> Master Catalog
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto space-y-8">
        {activeTab === 'planner' && (
          <div className="space-y-8">
            {/* INPUT PANEL CARD */}
            <div className="bg-slate-950/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-5 mb-6 gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <TestTube className="w-5 h-5 text-emerald-400" /> Agronomic Planning Inputs
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Select an active farm profile to automatically load stored soil & location parameters</p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Using Stored Farm Soil Values
                </div>
              </div>

              {/* FARM AUTOMATED INPUT FORM */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* 1. SELECT FARM */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Select Farm</label>
                  <select
                    value={activeFarmId}
                    onChange={(e) => setActiveFarmId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    {farms?.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.area} {f.areaUnit || 'Acres'} - {f.soilType || 'Black Soil'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. SEARCHABLE TARGET CROP SELECTOR */}
                <div className="relative" ref={cropDropdownRef}>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Target Crop ({cropsList.length} Supported)
                  </label>
                  <div
                    onClick={() => setIsCropDropdownOpen(!isCropDropdownOpen)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white flex items-center justify-between cursor-pointer hover:border-slate-700"
                  >
                    <span className="font-semibold">{selectedCrop}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </div>

                  {isCropDropdownOpen && (
                    <div className="absolute z-50 mt-2 w-full bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 space-y-2 max-h-72 flex flex-col">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search 50+ crops..."
                          value={cropSearch}
                          onChange={(e) => setCropSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                          autoFocus
                        />
                      </div>
                      <div className="overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                        {filteredCrops.length > 0 ? (
                          filteredCrops.map(c => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => {
                                setSelectedCrop(c);
                                setIsCropDropdownOpen(false);
                                setCropSearch('');
                              }}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                                selectedCrop === c ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              <span>{c}</span>
                              {selectedCrop === c && <CheckCheck className="w-4 h-4 text-emerald-400" />}
                            </button>
                          ))
                        ) : (
                          <div className="p-3 text-center text-xs text-slate-500">No crops found matching "{cropSearch}"</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. PREVIOUS CROP */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Previous Season Crop</label>
                  <select
                    value={previousCrop}
                    onChange={(e) => setPreviousCrop(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    {PREVIOUS_CROP_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* 4. GROWING SEASON */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Growing Season</label>
                  <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    {SEASONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ACTION BUTTON & ERROR MESSAGE */}
              <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-slate-800/80 pt-6">
                {errorMsg ? (
                  <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 px-4 py-2 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <Info className="w-4 h-4 text-emerald-400" /> Preserves farm area unit ({currentFarmObj?.areaUnit || currentFarmObj?.area_unit || 'Acres'})
                  </div>
                )}

                <button
                  onClick={handleGeneratePlan}
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" /> Optimizing Nutrition Plan...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" /> Generate Smart Nutrition Plan
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* RESULTS VIEW */}
            {plan && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                {/* SECTION 1: CROP SUMMARY HEADER */}
                <div className="bg-slate-950/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase">
                          1. Crop Summary: {plan.crop_summary?.crop} ({plan.crop_summary?.area_display})
                        </span>
                        <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-xs font-bold">
                          {plan.soil_summary?.mode === 'PRECISION' ? '🔬 Laboratory Soil Health Card' : '🌾 ICAR Regional Baseline'}
                        </span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                        Smart Crop Nutrition & Protection Advisory
                      </h2>
                      <p className="text-slate-400 text-xs md:text-sm mt-1">
                        State: <span className="text-slate-200 font-semibold">{plan.crop_summary?.state}</span> | Soil Type: <span className="text-slate-200 font-semibold">{plan.crop_summary?.soil_type}</span> | Season: <span className="text-slate-200 font-semibold">{plan.crop_summary?.season}</span> | Previous Crop: <span className="text-slate-200 font-semibold">{plan.crop_summary?.previous_crop}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                          <IndianRupee className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Grand Total Plan Cost</div>
                          <div className="text-2xl font-black text-white">{plan.cost_summary?.grand_total_display}</div>
                          <div className="text-xs text-emerald-400 font-semibold">
                            {plan.cost_summary?.total_nutrition_cost_display} Nutrition + {plan.cost_summary?.total_protection_cost_display} Protection
                          </div>
                        </div>
                      </div>

                      {/* DOWNLOAD SCHEDULE PDF BUTTON */}
                      <button
                        onClick={handleDownloadPDF}
                        className="px-5 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer shrink-0"
                      >
                        <Download className="w-5 h-5" /> Download Field PDF
                      </button>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: SOIL SUMMARY & BASELINE */}
                <div className="bg-slate-950/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl">
                  <div className="flex items-center gap-3">
                    <FlaskConical className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">2. Soil Summary</h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {plan.soil_summary?.mode === 'PRECISION'
                          ? 'Laboratory verified Soil Health Card data loaded for farm.'
                          : `Estimated regional ICAR baseline parameters active for ${plan.crop_summary?.soil_type} soil in ${plan.crop_summary?.state}.`}
                        {' '}pH: <span className="font-bold text-emerald-400">{plan.soil_summary?.soil_nutrients?.pH || 7.0}</span> | Organic Carbon: <span className="font-bold text-emerald-400">{plan.soil_summary?.soil_nutrients?.OC || 0.75}%</span> | EC: <span className="font-bold text-emerald-400">{plan.soil_summary?.soil_nutrients?.EC || 0.45} dS/m</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: NUTRIENT ANALYSIS MATRIX */}
                <div className="bg-slate-950/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <FlaskConical className="w-5 h-5 text-emerald-400" /> 3. Nutrient Status & Classification Matrix
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Compares verified soil values against {plan.crop_summary?.crop} target yield requirements (ICAR standard)
                      </p>
                    </div>
                    <span className="text-xs px-3 py-1 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 font-semibold">
                      Baseline: {plan.soil_summary?.soil_type}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
                    {plan.nutrient_matrix && Object.values(plan.nutrient_matrix).map(item => (
                      <div key={item.label} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[11px] font-bold text-slate-400 uppercase">{item.label}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              item.source === 'Farmer Input' 
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              {item.source === 'Farmer Input' ? 'Verified' : 'Estimated'}
                            </span>
                          </div>
                          <div className="text-lg font-extrabold text-white mt-1">
                            {item.available_nutrient} <span className="text-[10px] text-slate-400 font-normal">{item.unit}</span>
                          </div>
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-800/60 flex justify-between items-center text-[10px]">
                          <span className="text-slate-400">Class:</span>
                          <span className="font-bold text-emerald-400">{item.classification}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* NUTRIENT MATRIX TABLE */}
                  <div className="overflow-x-auto rounded-2xl border border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-slate-300 uppercase text-[10px] font-bold tracking-wider">
                        <tr>
                          <th className="p-3.5">Nutrient</th>
                          <th className="p-3.5">Available Status</th>
                          <th className="p-3.5">Source</th>
                          <th className="p-3.5">Classification</th>
                          <th className="p-3.5">Crop Target Demand</th>
                          <th className="p-3.5">Deficit Supply Needed</th>
                          <th className="p-3.5">Agronomic Recommendation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {plan.nutrient_matrix && Object.values(plan.nutrient_matrix).map(n => (
                          <tr key={n.label} className="hover:bg-slate-900/40">
                            <td className="p-3.5 font-bold text-white">{n.label}</td>
                            <td className="p-3.5">{n.available_nutrient} {n.unit}</td>
                            <td className="p-3.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${n.source === 'Farmer Input' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                                {n.source}
                              </span>
                            </td>
                            <td className="p-3.5 font-bold text-emerald-400">{n.classification}</td>
                            <td className="p-3.5">{n.crop_requirement} {n.unit}</td>
                            <td className="p-3.5 font-bold">
                              {n.deficit > 0 ? (
                                <span className="text-amber-400">+{n.deficit} {n.unit}</span>
                              ) : (
                                <span className="text-emerald-400">Sufficient</span>
                              )}
                            </td>
                            <td className="p-3.5 text-slate-400">{n.recommended_action}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* SECTION 4: MULTIPLE FERTILIZER PLANS */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Layers className="w-5 h-5 text-emerald-400" /> 4. Fertilizer Plans (Budget, Balanced, Premium Options)
                    </h3>
                    <p className="text-xs text-slate-400">Select a strategy card below to view custom application schedule</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plan.top_fertilizer_plans?.map((p, idx) => {
                      const isSelected = selectedPlanIndex === idx;
                      return (
                        <div
                          key={p.strategy}
                          onClick={() => setSelectedPlanIndex(idx)}
                          className={`rounded-3xl p-6 border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                            isSelected
                              ? 'bg-slate-950 border-emerald-500 shadow-2xl ring-2 ring-emerald-500/30'
                              : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Selected Plan
                            </div>
                          )}

                          <div>
                            <div className="inline-block px-2.5 py-1 rounded-lg bg-slate-900 text-emerald-400 font-bold text-[10px] uppercase mb-3">
                              {p.tag}
                            </div>
                            <h4 className="text-lg font-black text-white">{p.title}</h4>
                            <p className="text-xs text-slate-400 mt-2 leading-relaxed">{p.description}</p>

                            <div className="mt-4 space-y-1.5">
                              {p.advantages?.map((adv, aIdx) => (
                                <div key={aIdx} className="flex items-center gap-2 text-xs text-slate-300">
                                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  <span>{adv}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="mt-6 pt-4 border-t border-slate-800/80 flex justify-between items-end">
                            <div>
                              <div className="text-[10px] text-slate-400 uppercase font-bold">Est. Nutrition Cost</div>
                              <div className="text-xl font-black text-white">{p.cost?.total_cost_display}</div>
                            </div>
                            <div className="text-right">
                              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                                {p.score}% Match
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SECTION 5: SELECTED PLAN BREAKDOWN TABLE */}
                <div className="bg-slate-950/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 mb-6 gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-emerald-400" /> 5. Selected Plan ({activeSelectedPlan.title})
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">Exact fertilizer product formulations, commercial bags, and estimated market prices</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400 font-bold">Nutrition Cost Head</div>
                      <div className="text-xl font-extrabold text-emerald-400">{activeSelectedPlan.cost?.total_cost_display}</div>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-slate-300 uppercase text-[10px] font-bold tracking-wider">
                        <tr>
                          <th className="p-3.5">Fertilizer Product</th>
                          <th className="p-3.5">Grade / NPK</th>
                          <th className="p-3.5">Dose (kg/ha)</th>
                          <th className="p-3.5">Total Required Quantity</th>
                          <th className="p-3.5">Market Price</th>
                          <th className="p-3.5">Estimated Cost</th>
                          <th className="p-3.5">Application Method</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {activeSelectedPlan.items?.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/40">
                            <td className="p-3.5 font-bold text-white">
                              {item.name} <span className="text-[10px] font-normal text-slate-400">({item.type})</span>
                            </td>
                            <td className="p-3.5 font-mono text-emerald-400">{item.npk_ratio}</td>
                            <td className="p-3.5">{item.dose_per_ha} kg</td>
                            <td className="p-3.5 font-bold text-white">{item.quantity_display?.total_text}</td>
                            <td className="p-3.5">₹{item.cost_per_kg}/kg {item.price_per_bag ? `(₹${item.price_per_bag}/bag)` : ''}</td>
                            <td className="p-3.5 font-bold text-emerald-400">{item.cost_display}</td>
                            <td className="p-3.5 text-slate-400">{item.application_method}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* SECTION 6: STAGE-WISE APPLICATION SCHEDULE */}
                <div className="bg-slate-950/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
                  <div className="border-b border-slate-800 pb-4 mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Clock className="w-5 h-5 text-emerald-400" /> 6. Stage-Wise Application Schedule
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Split application timeline to maximize nutrient use efficiency (NUE)</p>
                  </div>

                  <div className="space-y-6 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-emerald-500/30 pl-8">
                    {plan.selected_plan_schedule?.map((stg, idx) => (
                      <div key={idx} className="relative bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                        <div className="absolute -left-11 top-5 w-6 h-6 rounded-full bg-emerald-500 border-4 border-slate-950 text-slate-950 flex items-center justify-center font-black text-[10px]">
                          {idx + 1}
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-800/80">
                          <div>
                            <h4 className="text-base font-extrabold text-white">{stg.stage}</h4>
                            <span className="text-xs text-emerald-400 font-semibold">{stg.timing}</span>
                          </div>
                          <div className="text-xs bg-slate-950 px-3 py-1 rounded-xl border border-slate-800 text-slate-400 font-mono">
                            Splits: N:{stg.nutrient_splits?.N_split_pct}% P:{stg.nutrient_splits?.P_split_pct}% K:{stg.nutrient_splits?.K_split_pct}%
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {stg.fertilizers?.map((f, fIdx) => (
                            <div key={fIdx} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
                              <div>
                                <div className="text-xs font-bold text-white">{f.name}</div>
                                <div className="text-[10px] text-slate-400 mt-0.5">{f.quantity_display?.total_text}</div>
                              </div>
                              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                                {f.dose_per_ha} kg/ha
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-3 text-xs text-slate-400 flex items-center gap-2 italic">
                          <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {stg.instructions}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTION 7: CROP PROTECTION PLAN */}
                <div className="bg-slate-950/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Shield className="w-5 h-5 text-emerald-400" /> 7. Crop Protection Plan
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">Weed control, disease prevention, pest management, and growth regulators</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400 font-bold">Protection Cost Head</div>
                      <div className="text-xl font-extrabold text-emerald-400">{plan.cost_summary?.total_protection_cost_display}</div>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-slate-300 uppercase text-[10px] font-bold tracking-wider">
                        <tr>
                          <th className="p-3.5">Category</th>
                          <th className="p-3.5">Target Problem</th>
                          <th className="p-3.5">Recommended Product</th>
                          <th className="p-3.5">Dose / Acre</th>
                          <th className="p-3.5">Application Method</th>
                          <th className="p-3.5">Est. Cost / Acre</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {[
                          ...(plan.protection_plan?.weed_management || []),
                          ...(plan.protection_plan?.disease_prevention || []),
                          ...(plan.protection_plan?.pest_management || []),
                          ...(plan.protection_plan?.micronutrient_spray || []),
                          ...(plan.protection_plan?.growth_promoter || [])
                        ].map((p, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/40">
                            <td className="p-3.5 font-bold text-emerald-400">{p.category}</td>
                            <td className="p-3.5 font-semibold text-white">{p.problem}</td>
                            <td className="p-3.5">
                              <b>{p.recommended_product}</b> {p.active_ingredient && p.active_ingredient !== 'N/A' ? <span className="text-[10px] text-slate-400">({p.active_ingredient})</span> : ''}
                            </td>
                            <td className="p-3.5">{p.dose_per_acre}</td>
                            <td className="p-3.5 text-slate-400">{p.application_method}</td>
                            <td className="p-3.5 font-bold text-white">{p.cost_display}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* SECTION 8: WEATHER ADVISORY */}
                {plan.weather_advisory?.current_summary && (
                  <div className="bg-gradient-to-r from-blue-950/60 to-slate-950/80 border border-blue-500/30 rounded-3xl p-6 md:p-8 shadow-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <Sun className="w-6 h-6 text-amber-400" />
                      <h3 className="text-lg font-bold text-white">8. Weather Advisory</h3>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed mb-4">
                      {plan.weather_advisory.current_summary}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {plan.weather_advisory.advisories?.map((adv, idx) => (
                        <div key={idx} className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                          <div className="text-xs font-bold text-amber-400">{adv.title}</div>
                          <div className="text-xs text-slate-400 mt-1">{adv.message}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SECTION 9: COST BREAKDOWN SUMMARY */}
                <div className="bg-slate-950/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
                  <div className="border-b border-slate-800 pb-4 mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <IndianRupee className="w-5 h-5 text-emerald-400" /> 9. Cost Breakdown
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Itemized cost heads for farm operational budget planning</p>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-800 mb-6">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-slate-300 uppercase text-[10px] font-bold tracking-wider">
                        <tr>
                          <th className="p-3.5">Cost Head</th>
                          <th className="p-3.5">Category</th>
                          <th className="p-3.5">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        <tr>
                          <td className="p-3.5 font-semibold text-white">Fertilizer Cost</td>
                          <td className="p-3.5 text-slate-400">Nutrition</td>
                          <td className="p-3.5 font-bold">{plan.cost_summary?.fertilizer_cost_display}</td>
                        </tr>
                        <tr>
                          <td className="p-3.5 font-semibold text-white">Micronutrient & Secondary Cost</td>
                          <td className="p-3.5 text-slate-400">Nutrition</td>
                          <td className="p-3.5 font-bold">{plan.cost_summary?.micronutrient_cost_display}</td>
                        </tr>
                        <tr>
                          <td className="p-3.5 font-semibold text-white">Herbicide Cost</td>
                          <td className="p-3.5 text-slate-400">Protection</td>
                          <td className="p-3.5 font-bold">{plan.cost_summary?.herbicide_cost_display}</td>
                        </tr>
                        <tr>
                          <td className="p-3.5 font-semibold text-white">Fungicide Cost</td>
                          <td className="p-3.5 text-slate-400">Protection</td>
                          <td className="p-3.5 font-bold">{plan.cost_summary?.fungicide_cost_display}</td>
                        </tr>
                        <tr>
                          <td className="p-3.5 font-semibold text-white">Insecticide Cost</td>
                          <td className="p-3.5 text-slate-400">Protection</td>
                          <td className="p-3.5 font-bold">{plan.cost_summary?.insecticide_cost_display}</td>
                        </tr>
                        <tr>
                          <td className="p-3.5 font-semibold text-white">Growth Regulator Cost</td>
                          <td className="p-3.5 text-slate-400">Protection</td>
                          <td className="p-3.5 font-bold">{plan.cost_summary?.growth_regulator_cost_display}</td>
                        </tr>
                        <tr>
                          <td className="p-3.5 font-semibold text-white">Application Labour & Misc</td>
                          <td className="p-3.5 text-slate-400">Operational</td>
                          <td className="p-3.5 font-bold">{plan.cost_summary?.application_cost_display}</td>
                        </tr>
                        <tr className="bg-slate-900 font-extrabold text-white">
                          <td className="p-4 text-sm text-emerald-400">GRAND TOTAL PLAN COST</td>
                          <td className="p-4 text-xs text-slate-400">Nutrition + Protection</td>
                          <td className="p-4 text-base text-emerald-400">{plan.cost_summary?.grand_total_display}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* SECTION 10: AI EXPLANATION */}
                <div className="bg-slate-950/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
                  <div className="border-b border-slate-800 pb-4 mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-emerald-400" /> 10. AI Explanation
                    </h3>
                  </div>
                  <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                    {plan.ai_explanation?.full_explanation}
                  </div>
                </div>

                {/* SECTION 11: IMPORTANT PRECAUTIONS */}
                <div className="bg-amber-950/20 border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <ShieldAlert className="w-6 h-6 text-amber-400" />
                    <h3 className="text-lg font-bold text-amber-300">11. Important Precautions</h3>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-amber-200/80 list-disc list-inside">
                    {(plan.important_precautions || [
                      "Wear protective gloves, eye goggles, and a mask while mixing and spraying agrochemicals.",
                      "Maintain a Pre-Harvest Interval (PHI) of at least 14 days after chemical spray before harvesting crops.",
                      "Never mix organophosphate insecticides with alkaline fertilizers (such as Lime or Calcium Nitrate).",
                      "Ensure adequate soil moisture before broadcasting granular fertilizers (Urea/DAP/MOP) to prevent root scorching.",
                      "Store remaining fertilizers and pesticides in a cool, dry, locked shed away from children and animals."
                    ]).map((prec, pIdx) => (
                      <li key={pIdx}>{prec}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* TAB 2: HISTORY */}
        {activeTab === 'history' && (
          <div className="bg-slate-950/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-emerald-400" /> Recommendation History
                </h2>
                <p className="text-xs text-slate-400 mt-1">Past generated nutrition plans for {currentFarmObj?.name || 'Active Farm'}</p>
              </div>
            </div>

            {history.length > 0 ? (
              <div className="space-y-4">
                {history.map((item) => (
                  <div key={item.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base font-extrabold text-white">{item.crop}</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">
                          {item.growth_stage}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        Recommended: <span className="text-white font-bold">{item.recommended_fertilizer}</span> ({item.total_quantity_kg} kg) • Est. Cost: <span className="text-emerald-400 font-bold">₹{item.estimated_cost_inr}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Created: {new Date(item.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                        Score: {item.confidence_score}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-sm">
                No past recommendation history found for this farm.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MASTER CATALOG */}
        {activeTab === 'catalog' && (
          <div className="bg-slate-950/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-400" /> Commercial Fertilizer Catalog ({masterCatalog.length} Products)
                </h2>
                <p className="text-xs text-slate-400 mt-1">Comprehensive database of commercial NPK, secondary, and micronutrient formulations</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search products, brands..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCatalog.map((item, idx) => (
                <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                        {item.type}
                      </span>
                      <span className="text-xs font-black text-white">₹{item.cost_per_kg}/kg</span>
                    </div>
                    <h4 className="text-base font-extrabold text-white">{item.name}</h4>
                    <p className="text-xs text-slate-400 mt-1">Brand: <span className="text-slate-200">{item.brand}</span></p>

                    <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-mono">
                      {item.N_pct > 0 && <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">N: {item.N_pct}%</span>}
                      {item.P_pct > 0 && <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">P: {item.P_pct}%</span>}
                      {item.K_pct > 0 && <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">K: {item.K_pct}%</span>}
                      {item.S_pct > 0 && <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">S: {item.S_pct}%</span>}
                      {item.Zn_pct > 0 && <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">Zn: {item.Zn_pct}%</span>}
                      {item.B_pct > 0 && <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">B: {item.B_pct}%</span>}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
                    <div><b>Application:</b> {item.application_method}</div>
                    <div><b>Crops:</b> {item.suitable_crops}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FertilizerRecommendation;
