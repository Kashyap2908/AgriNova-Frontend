import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Sprout, Cloud, Droplets, Thermometer, Wind } from 'lucide-react';

const RecommendationResult = ({ result }) => {
  if (!result || !result.recommendation) return null;

  const { recommendation, weather, season } = result;

  return (
    <motion.div 
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
        <h3 className="text-6xl font-extrabold mb-6 tracking-tight">{recommendation.crop}</h3>
        
        <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/10 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">Model Confidence</span>
            <span className="font-bold text-xl">{recommendation.confidence}%</span>
          </div>
          <div className="w-full bg-black/30 rounded-full h-2 mt-2">
            <div className="bg-emerald-400 h-2 rounded-full" style={{ width: `${recommendation.confidence}%` }}></div>
          </div>
        </div>

        {weather && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/5 mb-6 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-rose-200" />
              <div>
                <p className="text-xs text-emerald-100">Temperature</p>
                <p className="font-bold">{weather.temperature}°C</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-200" />
              <div>
                <p className="text-xs text-emerald-100">Humidity</p>
                <p className="font-bold">{weather.humidity}%</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-slate-200" />
              <div>
                <p className="text-xs text-emerald-100">Season</p>
                <p className="font-bold">{season}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="w-5 h-5 text-teal-200" />
              <div>
                <p className="text-xs text-emerald-100">Conditions</p>
                <p className="font-bold text-sm">{weather.description}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white/10 p-5 rounded-2xl border border-white/5">
          <p className="text-sm font-bold text-emerald-100 mb-2">Key Reasons:</p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            {recommendation.reason && recommendation.reason.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default RecommendationResult;
