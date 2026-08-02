import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Sprout, Cloud, Droplets, Thermometer, Wind, TrendingUp, Cpu, Zap, Layers } from 'lucide-react';

const RecommendationResult = ({ result }) => {
  if (!result || !result.recommendation) return null;

  const { recommendation, weather, season, mode, type, farm } = result;
  const isCompare = type === 'COMPARE' || (recommendation.comparison && recommendation.comparison.length > 0);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 rounded-[2rem] p-8 md:p-10 text-white shadow-2xl shadow-emerald-500/20 flex flex-col justify-between relative overflow-hidden"
    >
      <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none">
        <Sprout className="w-72 h-72" />
      </div>

      <div className="relative z-10 space-y-6">
        {/* Header badges */}
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full font-bold text-xs uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" /> Recommendation Ready
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 rounded-lg text-xs font-bold flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5" /> {mode === 'Quick' ? 'Quick Mode' : 'AI ML Mode'}
            </span>
            <span className="px-3 py-1 bg-cyan-400/20 text-cyan-200 border border-cyan-400/30 rounded-lg text-xs font-bold flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> {type === 'COMPARE' ? 'Compare Crops' : 'Best Crop'}
            </span>
          </div>
        </div>

        {/* Primary Recommended Crop Card */}
        <div>
          <p className="text-emerald-200 font-medium uppercase tracking-widest text-xs mb-1">Recommended Primary Crop</p>
          <h3 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">{recommendation.crop}</h3>
        </div>

        {/* Confidence & Expected Yield Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-black/30 backdrop-blur-md rounded-2xl p-5 border border-white/10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wide">Suitability Confidence</span>
              <span className="font-bold text-xl text-emerald-300">{recommendation.confidence}%</span>
            </div>
            <div className="w-full bg-black/40 rounded-full h-2.5">
              <div className="bg-gradient-to-r from-emerald-400 to-teal-300 h-2.5 rounded-full" style={{ width: `${Math.min(recommendation.confidence, 100)}%` }}></div>
            </div>
          </div>

          <div className="bg-black/30 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-300">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-200 uppercase tracking-wide">Expected Yield</p>
              <p className="text-2xl font-black text-white">{recommendation.expected_yield ? recommendation.expected_yield.toLocaleString() : 'N/A'} <span className="text-sm font-normal text-emerald-200">kg/ha</span></p>
            </div>
          </div>
        </div>

        {/* Weather Snapshot Grid */}
        {weather && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-200 mb-2">Live Weather Analyzed (7-Day Aggregate)</p>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-rose-300" />
                <div>
                  <p className="text-[10px] uppercase text-emerald-200">7-Day Avg Temp</p>
                  <p className="font-bold text-sm">{weather.temperature}°C</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-cyan-300" />
                <div>
                  <p className="text-[10px] uppercase text-emerald-200">7-Day Avg Humidity</p>
                  <p className="font-bold text-sm">{weather.humidity}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-indigo-300" />
                <div>
                  <p className="text-[10px] uppercase text-emerald-200">7-Day Cum. Rainfall</p>
                  <p className="font-bold text-sm">{weather.rainfall} mm</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-emerald-300" />
                <div>
                  <p className="text-[10px] uppercase text-emerald-200">Season & State</p>
                  <p className="font-bold text-xs truncate" title={`${season} (${farm?.state || 'Local'})`}>{season} ({farm?.state || 'Local'})</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comparison Section if COMPARE mode */}
        {isCompare && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-200 mb-2">Side-by-Side Crop Comparison</p>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {recommendation.comparison.map((comp, idx) => (
                <div key={idx} className="bg-black/30 backdrop-blur-sm p-3.5 rounded-xl border border-white/10 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white text-base block">{comp.crop}</span>
                    <span className="text-xs text-emerald-200">Suitability: <strong className="text-white">{comp.suitability}</strong></span>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-300 font-bold text-base block">{comp.expected_yield} kg/ha</span>
                    <span className="text-xs text-slate-300">Conf: {comp.confidence}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Reasons / Explanation */}
        <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-200 mb-2">Why This Recommendation:</p>
          <ul className="space-y-1.5 text-xs text-emerald-50">
            {recommendation.reason && recommendation.reason.map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default RecommendationResult;
