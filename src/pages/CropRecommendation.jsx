import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, MapPin, ArrowRight, TestTube, Scale, Droplets } from 'lucide-react';
import { FarmContext } from '../context/farm-context';
import { predictCropApi } from '../services/api';
import RecommendationResult from './RecommendationResult';
import { Link } from 'react-router-dom';

const CropRecommendation = () => {
  const { selectedFarm } = useContext(FarmContext);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!selectedFarm) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await predictCropApi(selectedFarm.id);
      if (response.success) {
        setResult(response.data);
      } else {
        setError("Failed to generate recommendation.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred during prediction.");
    } finally {
      setLoading(false);
    }
  };

  if (!selectedFarm) {
    return (
      <div className="py-12 max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">No Farm Selected</h2>
        <p className="mb-6">Please select a farm to generate crop recommendations.</p>
        <Link to="/select-farm" className="px-6 py-3 bg-primary text-white rounded-xl font-bold">Select Farm</Link>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-12 max-w-6xl mx-auto px-4 sm:px-6"
    >
      <div className="mb-10 text-center">
        <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight flex justify-center items-center gap-3">
          <Sprout className="w-10 h-10 text-emerald-500" /> AI Crop Recommendation
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto mb-4">
          Review your farm profile below. Our AI engine will analyze your soil data, live weather conditions, and seasonal parameters to recommend the optimal crop.
        </p>
        <Link to="/recommendation-history" className="text-emerald-500 hover:text-emerald-600 font-bold inline-flex items-center gap-1 text-sm underline underline-offset-4">
          View Past Recommendations
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Farm Profile Read-Only Section */}
        <div className="w-full lg:w-1/2 glass-card rounded-[2rem] p-8 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-200 dark:border-slate-700 pb-6 mb-6">
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">{selectedFarm.name || selectedFarm.farm_name}</h3>
              <p className="text-sm text-slate-500 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                {selectedFarm.village}, {selectedFarm.district}, {selectedFarm.state}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Scale className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Area</span>
                </div>
                <p className="font-bold">{selectedFarm.area || selectedFarm.farm_area} {selectedFarm.areaUnit || selectedFarm.area_unit || 'Acres'}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Droplets className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Water</span>
                </div>
                <p className="font-bold truncate" title={selectedFarm.waterAvailability || selectedFarm.water_availability}>{selectedFarm.waterAvailability || selectedFarm.water_availability}</p>
              </div>
            </div>

            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <TestTube className="w-5 h-5 text-indigo-500" /> Soil Specifications
            </h4>
            
            <div className="space-y-3 mb-8">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-slate-600 dark:text-slate-400 text-sm">Soil Type</span>
                <span className="font-bold">{selectedFarm.soilType || selectedFarm.soil_type}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-slate-600 dark:text-slate-400 text-sm">Nitrogen (N)</span>
                <span className="font-bold">{selectedFarm.nitrogen !== null ? selectedFarm.nitrogen : 'N/A'} kg/ha</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-slate-600 dark:text-slate-400 text-sm">Phosphorus (P)</span>
                <span className="font-bold">{selectedFarm.phosphorus !== null ? selectedFarm.phosphorus : 'N/A'} kg/ha</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-slate-600 dark:text-slate-400 text-sm">Potassium (K)</span>
                <span className="font-bold">{selectedFarm.potassium !== null ? selectedFarm.potassium : 'N/A'} kg/ha</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-slate-600 dark:text-slate-400 text-sm">Soil pH</span>
                <span className="font-bold">{selectedFarm.soil_ph !== null ? selectedFarm.soil_ph : 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400 text-sm">Organic Carbon</span>
                <span className="font-bold">{selectedFarm.organic_carbon !== null ? `${selectedFarm.organic_carbon}%` : 'N/A'}</span>
              </div>
            </div>
          </div>

          <div>
            {error && <div className="text-rose-500 text-sm font-bold text-center mb-4">{error}</div>}
            
            <button 
              onClick={handleGenerate} 
              disabled={loading}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-1 disabled:opacity-70 disabled:transform-none"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>Generate Recommendation <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="w-full lg:w-1/2">
          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-slate-400 glass-card rounded-[2rem] border-dashed border-2 border-slate-300 dark:border-slate-700 p-8 text-center min-h-[400px]"
              >
                <Sprout className="w-20 h-20 mb-4 opacity-50" />
                <h3 className="text-xl font-bold mb-2 text-slate-500 dark:text-slate-400">Ready to Analyze</h3>
                <p>Click "Generate Recommendation" to fetch real-time weather and analyze your farm's parameters.</p>
              </motion.div>
            )}

            {loading && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="h-full flex flex-col items-center justify-center bg-slate-900 text-white rounded-[2rem] p-8 shadow-2xl relative overflow-hidden min-h-[400px]"
              >
                <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] animate-pulse"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-6"></div>
                  <h3 className="text-2xl font-bold mb-2">Analyzing Farm Data...</h3>
                  <p className="text-emerald-400 font-mono">Fetching weather & running AI inference</p>
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
