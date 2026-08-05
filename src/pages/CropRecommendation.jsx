import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sprout, MapPin, ArrowRight, TestTube, Scale, Droplets, 
  Cpu, Zap, Layers, Check, CheckCircle2, Sliders, Info 
} from 'lucide-react';
import { FarmContext } from '../context/farm-context';
import { predictCropApi, fetchAvailableCropsApi } from '../services/api';
import RecommendationResult from './RecommendationResult';
import { Link } from 'react-router-dom';

const CropRecommendation = () => {
  const { selectedFarm, farms } = useContext(FarmContext);

  // Recommendation configuration states
  const [mode, setMode] = useState('AI'); // 'AI' or 'Quick'
  const [recType, setRecType] = useState('BEST'); // 'BEST' or 'COMPARE'

  // Editable Soil Test Report inputs
  const [nitrogen, setNitrogen] = useState(80);
  const [phosphorus, setPhosphorus] = useState(45);
  const [potassium, setPotassium] = useState(40);
  const [soilPh, setSoilPh] = useState(6.5);
  const [waterRequirement, setWaterRequirement] = useState(1200);

  // Available crops & crop comparison selection
  const [availableCrops, setAvailableCrops] = useState([]);
  const [selectedCompareCrops, setSelectedCompareCrops] = useState([]);
  const [loadingCrops, setLoadingCrops] = useState(false);

  // Execution states
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Pre-fill soil values when selected farm changes
  useEffect(() => {
    if (selectedFarm) {
      if (selectedFarm.nitrogen !== null && selectedFarm.nitrogen !== undefined) setNitrogen(selectedFarm.nitrogen);
      if (selectedFarm.phosphorus !== null && selectedFarm.phosphorus !== undefined) setPhosphorus(selectedFarm.phosphorus);
      if (selectedFarm.potassium !== null && selectedFarm.potassium !== undefined) setPotassium(selectedFarm.potassium);
      if (selectedFarm.soil_ph !== null && selectedFarm.soil_ph !== undefined) setSoilPh(selectedFarm.soil_ph);

      loadAvailableCrops(selectedFarm.id);
    }
  }, [selectedFarm]);

  const loadAvailableCrops = async (farmId) => {
    setLoadingCrops(true);
    try {
      const response = await fetchAvailableCropsApi(farmId);
      if (response.success && response.data?.crops) {
        setAvailableCrops(response.data.crops);
        // Pre-select first 3 crops for comparison convenience
        if (response.data.crops.length >= 2) {
          setSelectedCompareCrops(response.data.crops.slice(0, 3));
        }
      }
    } catch (err) {
      console.warn("Failed to load candidate crops:", err);
      setAvailableCrops(["Rice", "Maize", "Cotton", "Wheat", "Sugarcane", "Soybean"]);
      setSelectedCompareCrops(["Rice", "Maize", "Cotton"]);
    } finally {
      setLoadingCrops(false);
    }
  };

  const toggleCompareCrop = (cropName) => {
    if (selectedCompareCrops.includes(cropName)) {
      if (selectedCompareCrops.length > 1) {
        setSelectedCompareCrops(selectedCompareCrops.filter(c => c !== cropName));
      }
    } else {
      if (selectedCompareCrops.length < 5) {
        setSelectedCompareCrops([...selectedCompareCrops, cropName]);
      }
    }
  };

  const handleGenerate = async () => {
    if (!selectedFarm) return;

    setLoading(true);
    setError(null);

    const payload = {
      farm_id: selectedFarm.id,
      mode: mode,
      type: recType,
      nitrogen: Number(nitrogen),
      phosphorus: Number(phosphorus),
      potassium: Number(potassium),
      soil_ph: Number(soilPh),
      water_requirement: Number(waterRequirement),
      compare_crops: recType === 'COMPARE' ? selectedCompareCrops : []
    };

    try {
      const response = await predictCropApi(payload);
      if (response.success) {
        setResult(response.data);
      } else {
        setError(response.error || "Failed to generate crop recommendation.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred while processing the recommendation request.");
    } finally {
      setLoading(false);
    }
  };

  if (!selectedFarm) {
    return (
      <div className="py-16 max-w-4xl mx-auto px-4 text-center">
        <div className="glass-card rounded-[2.5rem] p-12 shadow-2xl">
          <Sprout className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">No Farm Selected</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
            Please select an active farm from your farm profile to run crop recommendation analysis.
          </p>
          <Link to="/select-farm" className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 transition-all inline-block">
            Select Active Farm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-10 max-w-7xl mx-auto px-4 sm:px-6"
    >
      {/* Title Header */}
      <div className="mb-10 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight flex justify-center items-center gap-3">
          <Sprout className="w-10 h-10 text-emerald-500" /> What to Grow
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg max-w-3xl mx-auto mb-4">
          Find out the best crop to grow on your land based on your soil type and local weather.
        </p>
        <Link to="/recommendation-history" className="text-emerald-500 hover:text-emerald-600 font-bold inline-flex items-center gap-1 text-sm underline underline-offset-4">
          View Past Recommendation History
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side: Controls & Input Panel */}
        <div className="w-full lg:w-1/2 space-y-6">

          {/* 1. Active Farm Banner */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest block mb-1">Active Selected Farm</span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{selectedFarm.name || selectedFarm.farm_name}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  {selectedFarm.village}, {selectedFarm.district}, <strong className="text-slate-700 dark:text-slate-300">{selectedFarm.state}</strong>
                </p>
              </div>
              <Link to="/select-farm" className="text-xs font-bold px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-all">
                Switch
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-xs">
              <div>
                <span className="text-slate-400 block">Soil Type</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedFarm.soilType || selectedFarm.soil_type || 'Loam'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Water Supply</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedFarm.waterAvailability || selectedFarm.water_availability || 'Medium'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Area</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedFarm.area || selectedFarm.farm_area} {selectedFarm.areaUnit || selectedFarm.area_unit || 'Acres'}</span>
              </div>
            </div>
          </div>

          {/* 2. Mode Selector: AI Recommendation vs Quick Recommendation */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800">
            <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-3">
              Step 1: Choose Recommendation Mode
            </label>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setMode('AI')}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  mode === 'AI' 
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100 shadow-md' 
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <Cpu className={`w-6 h-6 ${mode === 'AI' ? 'text-emerald-500' : 'text-slate-400'}`} />
                  {mode === 'AI' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm mb-1">AI Recommendation</h4>
                  <p className="text-[11px] opacity-80 leading-tight">With Soil Test Report & Machine Learning inference.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('Quick')}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  mode === 'Quick' 
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100 shadow-md' 
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <Zap className={`w-6 h-6 ${mode === 'Quick' ? 'text-amber-500' : 'text-slate-400'}`} />
                  {mode === 'Quick' && <CheckCircle2 className="w-5 h-5 text-amber-500" />}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm mb-1">Quick Recommendation</h4>
                  <p className="text-[11px] opacity-80 leading-tight">No Soil Test Report. Uses state, season & weather rules.</p>
                </div>
              </button>
            </div>
          </div>

          {/* 3. Recommendation Type Selector: Best Crop vs Compare Crops */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800">
            <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-3">
              Step 2: Choose Recommendation Type
            </label>

            <div className="grid grid-cols-2 gap-3 bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => setRecType('BEST')}
                className={`py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                  recType === 'BEST' 
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                <Sprout className="w-4 h-4 text-emerald-500" /> Recommend Best Crop
              </button>

              <button
                type="button"
                onClick={() => setRecType('COMPARE')}
                className={`py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                  recType === 'COMPARE' 
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                <Layers className="w-4 h-4 text-cyan-500" /> Compare Selected Crops
              </button>
            </div>
          </div>

          {/* 4. Soil Test Input Form (Only for AI Mode) */}
          {mode === 'AI' ? (
            <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <TestTube className="w-4 h-4 text-indigo-500" /> Soil Test Parameters (Editable)
                </h4>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full font-bold">Auto-Filled</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Nitrogen (N) kg/ha</label>
                  <input
                    type="number"
                    value={nitrogen}
                    onChange={(e) => setNitrogen(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Phosphorus (P) kg/ha</label>
                  <input
                    type="number"
                    value={phosphorus}
                    onChange={(e) => setPhosphorus(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Potassium (K) kg/ha</label>
                  <input
                    type="number"
                    value={potassium}
                    onChange={(e) => setPotassium(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Soil pH (0-14)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={soilPh}
                    onChange={(e) => setSoilPh(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="col-span-2 sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Water Requirement (mm)</label>
                  <input
                    type="number"
                    value={waterRequirement}
                    onChange={(e) => setWaterRequirement(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-3xl p-6 border border-amber-500/20 bg-amber-500/5 text-amber-900 dark:text-amber-200 text-xs leading-relaxed flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block mb-0.5 text-sm">Quick Mode Active (No Soil Report Required)</strong>
                No manual soil laboratory inputs needed. The engine will evaluate crops using your farm's state (<strong className="underline">{selectedFarm.state}</strong>), soil category, water availability, and 7-day live weather aggregates.
              </div>
            </div>
          )}

          {/* 5. Crop Selector Chips (Only when COMPARE mode is selected) */}
          {recType === 'COMPARE' && (
            <div className="glass-card rounded-3xl p-6 border border-cyan-500/20 bg-cyan-500/5 space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-extrabold text-cyan-700 dark:text-cyan-300 uppercase tracking-wider block">
                  Select 2 to 5 Crops to Compare
                </label>
                <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
                  {selectedCompareCrops.length} / 5 Selected
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {availableCrops.map((crop, idx) => {
                  const isSelected = selectedCompareCrops.includes(crop);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleCompareCrop(crop)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                        isSelected 
                          ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30' 
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      {crop}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submit Action Button */}
          {error && <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-bold rounded-2xl text-center">{error}</div>}

          <button 
            onClick={handleGenerate} 
            disabled={loading}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:transform-none"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                {recType === 'COMPARE' 
                  ? 'Compare Selected Crops' 
                  : (mode === 'AI' ? 'Generate AI Recommendation' : 'Run Quick Recommendation')}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

        </div>

        {/* Right Side: Result Display Screen */}
        <div className="w-full lg:w-1/2">
          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-slate-400 glass-card rounded-[2.5rem] border-dashed border-2 border-slate-300 dark:border-slate-800 p-8 text-center min-h-[480px]"
              >
                <Sprout className="w-20 h-20 mb-4 text-emerald-500/40" />
                <h3 className="text-2xl font-bold mb-2 text-slate-700 dark:text-slate-300">Ready for Analysis</h3>
                <p className="text-sm text-slate-500 max-w-sm">
                  Configure your recommendation parameters on the left panel and click to compute AI or Quick crop recommendations.
                </p>
              </motion.div>
            )}

            {loading && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full flex flex-col items-center justify-center bg-slate-900 text-white rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden min-h-[480px]"
              >
                <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] animate-pulse"></div>
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-6"></div>
                  <h3 className="text-2xl font-extrabold mb-2">Analyzing Farm & Weather...</h3>
                  <p className="text-emerald-400 font-mono text-xs max-w-xs">
                    Fetching 7-day weather aggregates & executing machine learning models
                  </p>
                </div>
              </motion.div>
            )}

            {result && !loading && (
              <RecommendationResult result={result} />
            )}
          </AnimatePresence>
        </div>

      </div>
    </motion.div>
  );
};

export default CropRecommendation;
