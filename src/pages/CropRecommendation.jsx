import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, TestTube, Thermometer, Droplets, ArrowRight, CheckCircle2 } from 'lucide-react';
import { predictCrop } from '../services/mlService';

const CropRecommendation = () => {
  const [formData, setFormData] = useState({
    N: 50,
    P: 50,
    K: 50,
    temperature: 28,
    humidity: 60,
    ph: 6.5,
    rainfall: 100,
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: parseFloat(value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const prediction = await predictCrop(formData);
    setResult(prediction);
    setLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-12 max-w-6xl mx-auto"
    >
      <div className="mb-10 text-center">
        <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight flex justify-center items-center gap-3">
          <Sprout className="w-10 h-10 text-emerald-500" /> ML Crop Engine
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
          Input your soil metrics and local environment parameters. Our XGBoost model will analyze historical agricultural data to recommend the most profitable crop.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Form Section */}
        <div className="w-full lg:w-1/2 glass-card rounded-[2rem] p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
                <TestTube className="w-5 h-5 text-indigo-500" /> Soil Nutrients (NPK)
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                    <span>Nitrogen (N)</span>
                    <span className="text-indigo-600 dark:text-indigo-400">{formData.N}</span>
                  </div>
                  <input type="range" name="N" min="0" max="140" value={formData.N} onChange={handleInputChange} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-indigo-500" />
                </div>
                <div>
                  <div className="flex justify-between text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                    <span>Phosphorus (P)</span>
                    <span className="text-pink-600 dark:text-pink-400">{formData.P}</span>
                  </div>
                  <input type="range" name="P" min="0" max="145" value={formData.P} onChange={handleInputChange} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-pink-500" />
                </div>
                <div>
                  <div className="flex justify-between text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                    <span>Potassium (K)</span>
                    <span className="text-amber-600 dark:text-amber-400">{formData.K}</span>
                  </div>
                  <input type="range" name="K" min="0" max="205" value={formData.K} onChange={handleInputChange} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-amber-500" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
                <Thermometer className="w-5 h-5 text-rose-500" /> Environment
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Temperature (°C)</label>
                  <input type="number" name="temperature" value={formData.temperature} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Humidity (%)</label>
                  <input type="number" name="humidity" value={formData.humidity} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">pH Level</label>
                  <input type="number" step="0.1" name="ph" value={formData.ph} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Rainfall (mm)</label>
                  <input type="number" name="rainfall" value={formData.rainfall} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white" />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-1 disabled:opacity-70 disabled:transform-none"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>Run AI Prediction <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>
        </div>

        {/* Results Section */}
        <div className="w-full lg:w-1/2">
          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-slate-400 glass-card rounded-[2rem] border-dashed border-2 border-slate-300 dark:border-slate-700 p-8 text-center"
              >
                <Sprout className="w-20 h-20 mb-4 opacity-50" />
                <h3 className="text-xl font-bold mb-2 text-slate-500 dark:text-slate-400">Awaiting Data</h3>
                <p>Adjust the parameters on the left and run the prediction to see AI recommendations.</p>
              </motion.div>
            )}

            {loading && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="h-full flex flex-col items-center justify-center bg-slate-900 text-white rounded-[2rem] p-8 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] animate-pulse"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-6"></div>
                  <h3 className="text-2xl font-bold mb-2">Analyzing Tensor Data...</h3>
                  <p className="text-emerald-400 font-mono">XGBoost inference in progress</p>
                </div>
              </motion.div>
            )}

            {result && !loading && (
              <motion.div 
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="h-full bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2rem] p-10 text-white shadow-2xl shadow-emerald-500/30 flex flex-col justify-center relative overflow-hidden"
              >
                <div className="absolute -top-10 -right-10 opacity-10">
                  <Sprout className="w-64 h-64" />
                </div>
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full font-bold text-sm mb-8">
                    <CheckCircle2 className="w-5 h-5 text-emerald-100" /> Prediction Complete
                  </div>
                  
                  <p className="text-emerald-100 font-medium uppercase tracking-widest text-sm mb-2">Recommended Crop</p>
                  <h3 className="text-6xl font-extrabold mb-6 tracking-tight">{result.crop}</h3>
                  
                  <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/10 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">Model Confidence</span>
                      <span className="font-bold text-xl">{result.confidence}%</span>
                    </div>
                    <div className="w-full bg-black/30 rounded-full h-2 mt-2">
                      <div className="bg-emerald-400 h-2 rounded-full" style={{ width: `${result.confidence}%` }}></div>
                    </div>
                  </div>
                  
                  <p className="text-emerald-50 text-lg leading-relaxed bg-white/10 p-6 rounded-2xl border border-white/5">
                    {result.details}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default CropRecommendation;
