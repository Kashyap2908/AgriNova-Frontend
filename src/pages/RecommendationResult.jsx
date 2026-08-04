import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Sprout, Cloud, Droplets, Thermometer, Wind,
  TrendingUp, Cpu, Zap, Layers, Medal, Award, Star, Store, IndianRupee, RefreshCw,
  BarChart2, ArrowRight, ChevronDown
} from 'lucide-react';
import { fetchCropMarketPriceApi, fetchAvailableCropsApi } from '../services/api';

// ─── Rank Badge ────────────────────────────────────────────────────────────────
const RankBadge = ({ rank }) => {
  const styles = {
    1: { bg: 'bg-amber-400/20', text: 'text-amber-300', border: 'border-amber-400/40', icon: <Medal className="w-3.5 h-3.5" /> },
    2: { bg: 'bg-slate-300/20', text: 'text-slate-300', border: 'border-slate-300/40', icon: <Award className="w-3.5 h-3.5" /> },
    3: { bg: 'bg-orange-400/20', text: 'text-orange-300', border: 'border-orange-400/40', icon: <Star className="w-3.5 h-3.5" /> },
  };
  const s = styles[rank] || { bg: 'bg-white/10', text: 'text-white/60', border: 'border-white/20', icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${s.bg} ${s.text} ${s.border}`}>
      {s.icon} #{rank}
    </span>
  );
};

// ─── Confidence Bar ────────────────────────────────────────────────────────────
const ConfidenceBar = ({ value }) => (
  <div className="w-full bg-black/40 rounded-full h-1.5 mt-1">
    <div
      className="bg-gradient-to-r from-emerald-400 to-teal-300 h-1.5 rounded-full transition-all"
      style={{ width: `${Math.min(value, 100)}%` }}
    />
  </div>
);

// ─── Primary (Rank #1) Card ────────────────────────────────────────────────────
const PrimaryCard = ({ item }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.05 }}
    className="bg-black/30 backdrop-blur-md rounded-2xl p-5 border border-amber-400/30 shadow-lg shadow-amber-500/10"
  >
    <div className="flex justify-between items-start mb-3">
      <div>
        <RankBadge rank={1} />
        <h3 className="text-3xl font-extrabold text-white mt-1 tracking-tight">{item.crop}</h3>
      </div>
      <div className="text-right">
        <p className="text-[10px] text-emerald-200 uppercase tracking-wide">Confidence</p>
        <p className="text-2xl font-black text-emerald-300">{item.confidence}%</p>
      </div>
    </div>
    <ConfidenceBar value={item.confidence} />
    <div className="flex items-center gap-2 mt-3">
      <TrendingUp className="w-4 h-4 text-emerald-300 flex-shrink-0" />
      <p className="text-sm font-semibold text-white">
        Expected Yield: <span className="text-emerald-300 font-black">{item.expected_yield?.toLocaleString()}</span>
        <span className="text-xs text-emerald-200 font-normal ml-1">kg/ha</span>
      </p>
    </div>
  </motion.div>
);

// ─── Secondary (Rank 2+) Card ──────────────────────────────────────────────────
const SecondaryCard = ({ item, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-black/25 backdrop-blur-sm rounded-xl p-3.5 border border-white/10 flex justify-between items-center"
  >
    <div className="flex items-center gap-3">
      <RankBadge rank={item.rank} />
      <div>
        <p className="font-bold text-white text-sm">{item.crop}</p>
        <div className="w-28">
          <ConfidenceBar value={item.confidence} />
        </div>
        <p className="text-[10px] text-emerald-200 mt-0.5">Conf: <strong className="text-white">{item.confidence}%</strong></p>
      </div>
    </div>
    <div className="text-right flex-shrink-0 ml-3">
      <p className="text-emerald-300 font-black text-sm">{item.expected_yield?.toLocaleString()}</p>
      <p className="text-[10px] text-emerald-200">kg/ha</p>
    </div>
  </motion.div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const RecommendationResult = ({ result }) => {
  if (!result || !result.recommendation) return null;

  const { recommendation, recommendations, weather, season, mode, type, farm } = result;

  const isBest    = type === 'BEST';
  const isCompare = type === 'COMPARE';

  const multiList = Array.isArray(recommendations) && recommendations.length > 0
    ? recommendations
    : null;

  const legacyCompare = !multiList && recommendation.comparison?.length > 0
    ? recommendation.comparison
    : null;

  // Selected crop for live market price lookup
  const initialCrop = multiList ? multiList[0].crop : (recommendation.crop || "Cotton");
  const [selectedCrop, setSelectedCrop] = useState(initialCrop);
  const [marketPriceData, setMarketPriceData] = useState(null);
  const [marketLoading, setMarketLoading] = useState(false);

  const candidateCrops = multiList ? multiList.map(item => item.crop) : [initialCrop];
  const [allCropsList, setAllCropsList] = useState(candidateCrops);

  useEffect(() => {
    if (farm?.id) {
      fetchAvailableCropsApi(farm.id)
        .then(res => {
          if (res.success && res.data?.crops) {
            setAllCropsList(Array.from(new Set([...candidateCrops, ...res.data.crops])));
          }
        })
        .catch(err => console.warn(err));
    }
  }, [farm?.id]);

  // Fetch market data from MarketCache / API whenever selectedCrop changes
  useEffect(() => {
    let isMounted = true;
    if (selectedCrop) {
      setMarketLoading(true);
      fetchCropMarketPriceApi(selectedCrop, farm?.id)
        .then(res => {
          if (isMounted && res.success) {
            setMarketPriceData(res.data);
          }
        })
        .finally(() => {
          if (isMounted) setMarketLoading(false);
        });
    }
    return () => { isMounted = false; };
  }, [selectedCrop, farm?.id]);

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

        {/* ── Header Badges ── */}
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full font-bold text-xs uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" /> Recommendation Ready
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 rounded-lg text-xs font-bold flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5" /> {mode === 'Quick' ? 'Quick Mode' : 'AI ML Mode'}
            </span>
            <span className="px-3 py-1 bg-cyan-400/20 text-cyan-200 border border-cyan-400/30 rounded-lg text-xs font-bold flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> {isCompare ? 'Compare Crops' : 'Best Crop'}
            </span>
          </div>
        </div>

        {/* ── Multi-Crop Recommendations List ── */}
        {multiList ? (
          <div>
            <p className="text-emerald-200 font-bold uppercase tracking-widest text-xs mb-3">
              {isBest ? 'Top Recommended Crops' : 'Selected Crops — Ranked by Suitability'}
            </p>

            <PrimaryCard item={multiList[0]} />

            {multiList.length > 1 && (
              <div className="space-y-2 mt-3">
                {multiList.slice(1).map((item, idx) => (
                  <SecondaryCard key={item.crop} item={item} delay={0.1 + idx * 0.05} />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ── BACKWARD COMPAT: Old single-crop display ── */
          <>
            <div>
              <p className="text-emerald-200 font-medium uppercase tracking-widest text-xs mb-1">Recommended Primary Crop</p>
              <h3 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">{recommendation.crop}</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-black/30 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wide">Suitability Confidence</span>
                  <span className="font-bold text-xl text-emerald-300">{recommendation.confidence}%</span>
                </div>
                <ConfidenceBar value={recommendation.confidence} />
              </div>
              <div className="bg-black/30 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex items-center gap-4">
                <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-300">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-emerald-200 uppercase tracking-wide">Expected Yield</p>
                  <p className="text-2xl font-black text-white">
                    {recommendation.expected_yield ? recommendation.expected_yield.toLocaleString() : 'N/A'}
                    <span className="text-sm font-normal text-emerald-200 ml-1">kg/ha</span>
                  </p>
                </div>
              </div>
            </div>

            {legacyCompare && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-200 mb-2">Side-by-Side Crop Comparison</p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {legacyCompare.map((comp, idx) => (
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
          </>
        )}

        {/* ── CROP MARKET PRICE INTEGRATION (MarketCache Instant Check) ── */}
        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-5 border border-amber-400/30 space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Store className="w-4 h-4 text-amber-400" /> Market Intelligence (APMC Price)
            </p>
            {/* Crop Selection Dropdown & Quick Chips */}
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="w-full sm:w-44 bg-black/50 text-white font-bold text-xs border border-white/20 rounded-lg px-2.5 py-1 pr-7 appearance-none cursor-pointer outline-none focus:border-amber-400"
                >
                  <optgroup label="Recommended Crops">
                    {candidateCrops.map(c => (
                      <option key={c} value={c} className="bg-slate-900 text-white">{c} (Ranked)</option>
                    ))}
                  </optgroup>
                  <optgroup label="All Available Crops">
                    {allCropsList.filter(c => !candidateCrops.includes(c)).map(c => (
                      <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>
                    ))}
                  </optgroup>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-300 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Quick Chip Shortcuts for Candidate Crops */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            <span className="text-[10px] text-emerald-200/80 font-semibold self-center mr-1">Quick Select:</span>
            {candidateCrops.map(cropName => (
              <button
                key={cropName}
                onClick={() => setSelectedCrop(cropName)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all ${
                  selectedCrop === cropName 
                    ? 'bg-amber-400 text-slate-950 font-black shadow' 
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                {cropName}
              </button>
            ))}
          </div>

          {marketLoading ? (
            <div className="py-4 text-center text-amber-200/60 text-xs font-mono flex items-center justify-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Checking MarketCache...
            </div>
          ) : marketPriceData?.current_price ? (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3 text-center pt-1">
                <div className="bg-black/30 p-2.5 rounded-xl border border-white/10">
                  <span className="text-[10px] text-emerald-200 uppercase font-bold block">Min Price</span>
                  <span className="font-extrabold text-sm text-white">₹{marketPriceData.current_price.minimum_price}</span>
                </div>
                <div className="bg-amber-400/20 p-2.5 rounded-xl border border-amber-400/30">
                  <span className="text-[10px] text-amber-300 uppercase font-bold block">Modal Price</span>
                  <span className="font-black text-base text-amber-300">₹{marketPriceData.current_price.modal_price}</span>
                </div>
                <div className="bg-black/30 p-2.5 rounded-xl border border-white/10">
                  <span className="text-[10px] text-emerald-200 uppercase font-bold block">Max Price</span>
                  <span className="font-extrabold text-sm text-white">₹{marketPriceData.current_price.maximum_price}</span>
                </div>
              </div>

              <Link
                to={`/market-intelligence?crop=${encodeURIComponent(selectedCrop)}`}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-xs font-extrabold rounded-xl border border-amber-400/40 transition-all group"
              >
                <BarChart2 className="w-3.5 h-3.5" />
                View Full Market Intelligence & Predictions for {selectedCrop}
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ) : (
            <p className="text-xs text-emerald-200/70 text-center py-2">Select a crop above to load MarketCache APMC prices.</p>
          )}
        </div>

        {/* ── Weather Snapshot Grid ── */}
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

        {/* ── Key Reasons / Explanation ── */}
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
