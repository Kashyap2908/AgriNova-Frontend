import React, { useState, useEffect, useContext } from 'react';
import { FarmContext } from '../context/farm-context';
import { recommendFertilizerApi, fetchFertilizerHistoryApi, fetchFertilizerMasterApi } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical, Sparkles, CheckCircle2, AlertTriangle, ShieldAlert, CloudSun,
  Calendar, IndianRupee, ArrowRight, RefreshCw, FileText, ChevronRight, TestTube,
  Info, Leaf, Scale, Clock, Layers, History, BookOpen, AlertCircle
} from 'lucide-react';

const STAGES = [
  "Basal / Sowing",
  "Vegetative / Active Tillering",
  "Flowering / Square Formation",
  "Grain Filling / Fruit Set",
  "Maturity & Harvest"
];

const FertilizerRecommendation = () => {
  const { selectedFarm, farms } = useContext(FarmContext);
  const [activeFarmId, setActiveFarmId] = useState(selectedFarm?.id || (farms?.[0]?.id || ''));
  const [selectedStage, setSelectedStage] = useState("Basal / Sowing");
  
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [history, setHistory] = useState([]);
  const [masterCatalog, setMasterCatalog] = useState([]);
  const [activeTab, setActiveTab] = useState('recommendation'); // 'recommendation' | 'history' | 'catalog'
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (selectedFarm?.id) {
      setActiveFarmId(selectedFarm.id);
    }
  }, [selectedFarm]);

  useEffect(() => {
    if (activeFarmId) {
      loadHistory(activeFarmId);
    }
    loadMasterCatalog();
  }, [activeFarmId]);

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
      console.warn("Failed to load fertilizer master:", err);
    }
  };

  const handleGenerateRecommendation = async () => {
    if (!activeFarmId) {
      setErrorMsg("Please select a farm first.");
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await recommendFertilizerApi(activeFarmId, selectedStage);
      if (res?.success) {
        setRecommendation(res.data);
        loadHistory(activeFarmId);
      } else {
        setErrorMsg(res?.message || "Failed to generate recommendation.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Error calling fertilizer recommendation service.");
    } finally {
      setLoading(false);
    }
  };

  const currentFarmObj = farms.find(f => f.id === Number(activeFarmId)) || selectedFarm;
  const hasSoilData = Boolean(
    currentFarmObj?.nitrogen !== null && currentFarmObj?.nitrogen !== undefined &&
    currentFarmObj?.phosphorus !== null && currentFarmObj?.phosphorus !== undefined &&
    currentFarmObj?.potassium !== null && currentFarmObj?.potassium !== undefined
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide border border-white/10">
              <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
              <span>Smart Agricultural Decision Engine</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Fertilizer Recommendation System
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              Precision nutrient analysis, rule-based weather safety, dosage calculations, and AI explanations tailored for your farm.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('recommendation')}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                activeTab === 'recommendation' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" /> Recommendation
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                activeTab === 'history' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <History className="w-4 h-4" /> History ({history.length})
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                activeTab === 'catalog' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" /> Fertilizer Catalog
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      {activeTab === 'recommendation' && (
        <div className="space-y-8">
          
          {/* Controls Bar: Farm & Growth Stage Selector */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-100 dark:border-slate-700 flex flex-col lg:flex-row items-center justify-between gap-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-auto flex-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  Select Active Farm
                </label>
                <select
                  value={activeFarmId}
                  onChange={(e) => setActiveFarmId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {farms.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.farm_name || f.name} ({f.district}, {f.state})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  Crop Growth Stage
                </label>
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {STAGES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Accuracy Indicator Badge */}
            <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-4 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-700 pt-4 lg:pt-0 lg:pl-6">
              {hasSoilData ? (
                <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-emerald-600 text-white font-extrabold text-[10px] rounded uppercase">
                      High Accuracy
                    </span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Soil Health Card Data Available (90–98% Confidence)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-2xl">
                  <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-amber-500 text-white font-extrabold text-[10px] rounded uppercase">
                      Estimated Mode
                    </span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      No Soil Test Data (60–80% Confidence)
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={handleGenerateRecommendation}
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Analyzing Soil & Crop...</span>
                  </>
                ) : (
                  <>
                    <FlaskConical className="w-5 h-5" />
                    <span>Recommend Fertilizer</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Missing NPK Notice Prompt */}
          {!hasSoilData && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <strong className="text-amber-600 dark:text-amber-400">Notice:</strong> Your farm does not have Soil Health Card (NPK) values saved. Recommendations are currently estimated using crop demand, soil type, and weather. Update your farm profile to enable High Accuracy Soil Analysis.
                </p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-2xl p-4 text-rose-600 text-sm font-bold flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* RECOMMENDATION DISPLAY RESULT */}
          {recommendation && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              
              {/* Main Primary Fertilizer Banner Card */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-700 pb-6">
                  
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase ${
                        recommendation.recommendation_type === 'SOIL_BASED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                      }`}>
                        {recommendation.recommendation_type_display}
                      </span>
                      <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs font-bold">
                        Confidence: {recommendation.confidence_score}%
                      </span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
                      <span>{recommendation.recommended_fertilizer}</span>
                      <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                        {recommendation.fertilizer_details?.N_pct}-{recommendation.fertilizer_details?.P_pct}-{recommendation.fertilizer_details?.K_pct}
                      </span>
                    </h2>
                    
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      Crop: <strong className="text-slate-800 dark:text-white">{recommendation.crop}</strong> • Growth Stage: <strong className="text-slate-800 dark:text-white">{recommendation.growth_stage}</strong>
                    </p>
                  </div>

                  {/* Quantity & Cost Quick Highlights */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full lg:w-auto">
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl text-center border border-slate-100 dark:border-slate-700">
                      <Scale className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Dosage / Acre</span>
                      <p className="text-lg font-black text-slate-800 dark:text-white">{recommendation.dosage_per_acre_kg} kg</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl text-center border border-slate-100 dark:border-slate-700">
                      <Layers className="w-5 h-5 text-teal-600 dark:text-teal-400 mx-auto mb-1" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Total Quantity</span>
                      <p className="text-lg font-black text-slate-800 dark:text-white">{recommendation.total_quantity_kg} kg</p>
                    </div>

                    <div className="col-span-2 sm:col-span-1 bg-emerald-500/10 dark:bg-emerald-500/20 p-4 rounded-2xl text-center border border-emerald-500/30">
                      <IndianRupee className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
                      <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase">Est. Total Cost</span>
                      <p className="text-lg font-black text-emerald-700 dark:text-emerald-300">₹{recommendation.estimated_cost_inr}</p>
                    </div>
                  </div>

                </div>

                {/* AI Explanation & Weather Safety Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                  
                  {/* AI Explanation Panel */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-500" /> AI Agricultural Explanation
                    </h3>
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                      {recommendation.ai_explanation}
                    </div>
                  </div>

                  {/* Weather Intelligence Card */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <CloudSun className="w-4 h-4 text-teal-500" /> Weather Intelligence Rule
                    </h3>
                    <div className={`p-5 rounded-2xl border text-sm font-medium space-y-2 ${
                      recommendation.weather_rules?.safe_to_apply ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-300' : 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-300'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" /> {recommendation.weather_rules?.status}
                        </span>
                        {recommendation.weather_rules?.delay_days > 0 && (
                          <span className="px-2 py-0.5 bg-amber-500 text-white font-extrabold text-[10px] rounded">
                            Delay {recommendation.weather_rules.delay_days} Days
                          </span>
                        )}
                      </div>
                      <p className="text-xs leading-relaxed opacity-90">
                        {recommendation.weather_rules?.weather_advice}
                      </p>
                    </div>
                  </div>

                </div>

              </div>

              {/* Nutrient Analysis Matrix & Application Timeline Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Nutrient Deficiency Matrix */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-700 space-y-4">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <TestTube className="w-5 h-5 text-emerald-500" /> Crop Nutrient Analysis Matrix
                  </h3>

                  <div className="space-y-3">
                    {Object.entries(recommendation.nutrient_analysis || {}).map(([key, data]) => (
                      <div key={key} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-extrabold uppercase text-slate-400">{key.replace('_', ' ')}</p>
                          <p className="text-sm font-extrabold text-slate-800 dark:text-white">
                            Current: <span className="text-emerald-600 dark:text-emerald-400">{data.current}</span> / Ideal: {data.ideal}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-xl text-xs font-extrabold ${
                          data.status === 'Low' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                        }`}>
                          {data.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Application Timeline & Split Schedule */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-700 space-y-4">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-teal-500" /> Split Application Schedule
                  </h3>

                  <div className="space-y-4">
                    {(recommendation.application_schedule || []).map((step, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white font-black flex items-center justify-center text-sm flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">{step.day}</h4>
                            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{step.quantity_kg} kg</span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{step.instructions}</p>
                          <span className="inline-block px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-[10px] font-bold rounded text-slate-600 dark:text-slate-400">
                            Method: {step.method}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Alternative Fertilizers & Safety Warnings Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Ranked Alternatives */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-700 space-y-4">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-emerald-500" /> Ranked Alternative Fertilizers
                  </h3>

                  <div className="space-y-3">
                    {(recommendation.alternative_fertilizers || []).map((alt, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-start justify-between gap-4">
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                            <span>{alt.name}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded">NPK {alt.npk_ratio}</span>
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{alt.reason}</p>
                        </div>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                          ₹{alt.price_per_kg}/kg
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Safety & Operational Warnings */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-700 space-y-4">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-rose-500" /> Safety & Agricultural Guidelines
                  </h3>

                  <div className="space-y-3">
                    {(recommendation.safety_warnings || []).map((warn, idx) => (
                      <div key={idx} className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-3">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <span>{warn}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </motion.div>
          )}

        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 dark:border-slate-700 space-y-6">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-6 h-6 text-emerald-500" /> Past Fertilizer Recommendations
          </h2>

          {history.length === 0 ? (
            <p className="text-sm font-semibold text-slate-400 text-center py-12">No recommendation history found for this farm.</p>
          ) : (
            <div className="space-y-4">
              {history.map((rec) => (
                <div key={rec.id} className="p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        rec.recommendation_type === 'SOIL_BASED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                      }`}>
                        {rec.recommendation_type}
                      </span>
                      <span className="text-xs font-bold text-slate-400">{new Date(rec.created_at).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{rec.recommended_fertilizer}</h3>
                    <p className="text-xs font-semibold text-slate-500">
                      Crop: {rec.crop} • Stage: {rec.growth_stage} • Farm: {rec.farm_name}
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Total Quantity</span>
                      <p className="text-sm font-black text-slate-800 dark:text-white">{rec.total_quantity_kg} kg</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Est. Cost</span>
                      <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">₹{rec.estimated_cost_inr}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Catalog Tab */}
      {activeTab === 'catalog' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 dark:border-slate-700 space-y-6">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-500" /> Fertilizer Reference Master Catalog
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {masterCatalog.map((item, idx) => (
              <div key={idx} className="p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-800 dark:text-white">{item.Fertilizer_Name}</h3>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 rounded">
                      {item.Fertilizer_Type}
                    </span>
                  </div>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">₹{item.Price_per_kg}/kg</span>
                </div>

                <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 space-y-1">
                  <p>NPK Ratio: <strong className="text-slate-900 dark:text-white">{item.N_pct}-{item.P_pct}-{item.K_pct}</strong></p>
                  <p>Form: {item.Physical_Form}</p>
                  <p>Method: {item.Application_Method}</p>
                  <p className="text-[10px] text-slate-400 mt-2">Source: {item.Source}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default FertilizerRecommendation;
