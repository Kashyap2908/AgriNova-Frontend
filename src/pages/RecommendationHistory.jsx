import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchRecommendationHistoryApi } from '../services/api';
import { History, Sprout, Calendar, CheckCircle2, ChevronRight, Cpu, Zap, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

const RecommendationHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetchRecommendationHistoryApi();
        if (response && response.success && response.data) {
          setHistory(response.data);
        } else if (Array.isArray(response)) {
          setHistory(response);
        }
      } catch (err) {
        console.error("Failed to fetch recommendation history", err);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  return (
    <div className="py-12 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-bold text-xs mb-3">
            <History className="w-3.5 h-3.5 text-emerald-500" />
            Recommendation Logs
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Recommendation History
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm sm:text-base">
            Review past crop recommendations, yield predictions, and climate snapshots.
          </p>
        </div>
        
        <Link 
          to="/crop-recommendation" 
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all text-sm"
        >
          <Sprout className="w-4 h-4" /> New Prediction
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
      ) : history.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-12 text-center max-w-xl mx-auto flex flex-col items-center rounded-3xl"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-slate-800 flex items-center justify-center text-emerald-500 mb-4">
            <History className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-2">No History Logged Yet</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
            You haven't run any crop recommendations yet. Launch the recommendation engine to generate your first analysis.
          </p>
          <Link to="/crop-recommendation" className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl text-sm shadow-md">
            Generate First Recommendation
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-emerald-400 transition-all"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">{item.recommended_crop}</h3>
                    <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5" /> 
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> {item.confidence}%
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px] font-bold flex items-center gap-1">
                    <Cpu className="w-3 h-3" /> {item.recommendation_mode || 'AI'} Mode
                  </span>
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px] font-bold flex items-center gap-1">
                    <Layers className="w-3 h-3" /> {item.recommendation_type || 'BEST'}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 text-xs space-y-1.5 mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Farm:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{item.farm_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Expected Yield:</span>
                    <span className="font-bold text-emerald-500">{item.expected_yield ? `${item.expected_yield} kg/ha` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Season & State:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{item.season} ({item.farm_state})</span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 font-mono italic truncate" title={item.prediction_source}>
                Source: {item.prediction_source}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendationHistory;
