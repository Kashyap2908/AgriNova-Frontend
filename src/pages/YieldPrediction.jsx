import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { FarmContext } from '../context/farm-context';
import { fetchYieldSummaryApi, fetchAvailableCropsApi } from '../services/api';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, MapPin, Calendar, Sprout, Thermometer, Droplets, Wind, CloudRain, 
  FlaskConical, CheckCircle2, AlertTriangle, Layers, Info, ArrowRight, RefreshCw, BarChart2, ChevronDown
} from 'lucide-react';

const YieldPrediction = () => {
  const { selectedFarm } = useContext(FarmContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableCrops, setAvailableCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState(null);

  // Load available crops for dropdown
  useEffect(() => {
    if (selectedFarm?.id) {
      fetchAvailableCropsApi(selectedFarm.id)
        .then(res => {
          if (res.success && res.data?.crops) {
            setAvailableCrops(res.data.crops);
          }
        })
        .catch(err => console.warn('Crops fetch error:', err));
    }
  }, [selectedFarm?.id]);

  const loadYieldSummary = async (crop = selectedCrop) => {
    if (!selectedFarm) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetchYieldSummaryApi(selectedFarm.id, null, crop);
      if (res.success && res.data) {
        setData(res.data);
        if (!selectedCrop) {
          setSelectedCrop(res.data.crop_info.selected_crop);
        }
      } else {
        throw new Error(res.error || 'Failed to fetch yield prediction details.');
      }
    } catch (err) {
      console.error('Yield Summary Error:', err);
      setError(err.response?.data?.error || err.message || 'Yield Prediction Failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedCrop(null);
    loadYieldSummary(null);
  }, [selectedFarm?.id]);

  const handleCropChange = (e) => {
    const newCrop = e.target.value;
    setSelectedCrop(newCrop);
    loadYieldSummary(newCrop);
  };

  if (!selectedFarm) {
    return (
      <div className="py-20 h-full flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="saas-card max-w-lg p-10 text-center flex flex-col items-center"
        >
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
            <MapPin className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-3xl font-extrabold mb-2 text-slate-900 dark:text-white">No Farm Selected</h2>
          <p className="text-slate-500 mb-6">Select a farm from the dashboard to view yield predictions.</p>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-20 h-full flex flex-col items-center justify-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full"></div>
          <TrendingUp className="w-16 h-16 text-emerald-500 animate-pulse relative z-10" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Analyzing Harvest Data...</h3>
        <p className="text-slate-500 font-medium">Calculating expected harvest for {selectedFarm.name}</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-20 max-w-4xl mx-auto px-4 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="saas-card p-10 text-center border-amber-200 dark:border-amber-900/50 relative overflow-hidden"
        >
          <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">Harvest Estimate Failed</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
            {error || 'Unable to calculate harvest estimate for this farm.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => loadYieldSummary(selectedCrop)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all"
            >
              <RefreshCw className="w-5 h-5" /> Retry Prediction
            </button>
            <Link
              to="/crop-recommendation"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-all"
            >
              <Sprout className="w-5 h-5" /> Run Crop Recommendation
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }


  const { crop_info, prediction_inputs, yield_prediction, yield_analysis, recommendations } = data;

  return (
    <div className="py-8 max-w-[1400px] mx-auto px-4 sm:px-6 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2 flex items-center gap-3">
            <TrendingUp className="w-10 h-10 text-emerald-500" /> Harvest Estimate
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
            Smart calculation of your expected harvest
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="relative">
            <select
              value={selectedCrop || crop_info.selected_crop}
              onChange={handleCropChange}
              className="w-full sm:w-60 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-sm border-2 border-emerald-500/30 rounded-2xl px-4 py-2.5 pr-10 appearance-none cursor-pointer outline-none focus:border-emerald-500 shadow-sm"
            >
              <optgroup label="Analyzed Crop">
                <option value={crop_info.selected_crop}>{crop_info.selected_crop} (Default)</option>
              </optgroup>
              <optgroup label="Select Custom Crop">
                {availableCrops.filter(c => c.toLowerCase() !== crop_info.selected_crop.toLowerCase()).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </optgroup>
            </select>
            <ChevronDown className="w-4 h-4 text-emerald-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button 
            onClick={() => loadYieldSummary(selectedCrop)}
            className="px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <Link
            to="/profit-prediction"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 font-bold text-sm transition-all"
          >
            View Profit Analysis <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* SECTION 1: Crop Information */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="saas-card p-6 md:p-8 bg-gradient-to-br from-emerald-900/10 via-slate-900/5 to-slate-900/10 border-emerald-500/20"
      >
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Sprout className="w-5 h-5 text-emerald-500" /> Farm Details
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-4">
          <div className="p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Farm Name</span>
            <span className="font-extrabold text-base text-slate-800 dark:text-white truncate block" title={crop_info.farm_name}>{crop_info.farm_name}</span>
          </div>

          <div className="p-4 bg-emerald-500/10 backdrop-blur-md rounded-2xl border border-emerald-500/30">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">Selected Crop</span>
            <span className="font-black text-lg text-emerald-600 dark:text-emerald-300 truncate block">{crop_info.selected_crop}</span>
          </div>

          <div className="p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">State</span>
            <span className="font-bold text-base text-slate-800 dark:text-white truncate block">{crop_info.state}</span>
          </div>

          <div className="p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">District</span>
            <span className="font-bold text-base text-slate-800 dark:text-white truncate block">{crop_info.district}</span>
          </div>

          <div className="p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Season</span>
            <span className="font-bold text-base text-slate-800 dark:text-white truncate block">{crop_info.season}</span>
          </div>

          <div className="p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Farm Area</span>
            <span className="font-extrabold text-base text-slate-800 dark:text-white block">{crop_info.farm_area}</span>
          </div>

          <div className="p-4 bg-indigo-500/10 backdrop-blur-md rounded-2xl border border-indigo-500/30">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-300 block mb-1">Area Unit</span>
            <span className="font-black text-base text-indigo-600 dark:text-indigo-300 block">{crop_info.farm_area_unit}</span>
          </div>
        </div>
      </motion.div>

      {/* SECTION 2: Prediction Inputs */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="saas-card p-6 md:p-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-blue-500" /> Your Farm's Soil and Weather Info
            </h2>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
              The information we used to calculate your harvest estimate
            </p>
          </div>

          {/* Soil Health Status Badge */}
          {prediction_inputs.has_soil_health_card ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs rounded-full self-start sm:self-auto">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              🟢 Using Verified Soil Test Data
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-extrabold text-xs rounded-full self-start sm:self-auto">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              🟡 Using Estimated Soil Data
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          
          {/* 1. Nitrogen */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Nitrogen (N)</span>
              <p className="text-2xl font-black text-slate-800 dark:text-white">{prediction_inputs.nitrogen} <span className="text-xs font-normal text-slate-400">kg/ha</span></p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400" title={prediction_inputs.has_soil_health_card ? "Uploaded by the farmer." : "Used because no Soil Health Card is available."}>
              <span className="truncate">Source: <strong className="text-slate-700 dark:text-slate-200">{prediction_inputs.input_sources?.nitrogen || (prediction_inputs.has_soil_health_card ? "Soil Health Card" : "Estimated (No Soil Health Card)")}</strong></span>
              <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 cursor-help ml-1" />
            </div>
          </div>

          {/* 2. Phosphorus */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Phosphorus (P)</span>
              <p className="text-2xl font-black text-slate-800 dark:text-white">{prediction_inputs.phosphorus} <span className="text-xs font-normal text-slate-400">kg/ha</span></p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400" title={prediction_inputs.has_soil_health_card ? "Uploaded by the farmer." : "Used because no Soil Health Card is available."}>
              <span className="truncate">Source: <strong className="text-slate-700 dark:text-slate-200">{prediction_inputs.input_sources?.phosphorus || (prediction_inputs.has_soil_health_card ? "Soil Health Card" : "Estimated (No Soil Health Card)")}</strong></span>
              <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 cursor-help ml-1" />
            </div>
          </div>

          {/* 3. Potassium */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Potassium (K)</span>
              <p className="text-2xl font-black text-slate-800 dark:text-white">{prediction_inputs.potassium} <span className="text-xs font-normal text-slate-400">kg/ha</span></p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400" title={prediction_inputs.has_soil_health_card ? "Uploaded by the farmer." : "Used because no Soil Health Card is available."}>
              <span className="truncate">Source: <strong className="text-slate-700 dark:text-slate-200">{prediction_inputs.input_sources?.potassium || (prediction_inputs.has_soil_health_card ? "Soil Health Card" : "Estimated (No Soil Health Card)")}</strong></span>
              <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 cursor-help ml-1" />
            </div>
          </div>

          {/* 4. Soil pH */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Soil pH</span>
              <p className="text-2xl font-black text-slate-800 dark:text-white">{prediction_inputs.ph}</p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400" title={prediction_inputs.has_soil_health_card ? "Uploaded by the farmer." : "Used because no Soil Health Card is available."}>
              <span className="truncate">Source: <strong className="text-slate-700 dark:text-slate-200">{prediction_inputs.input_sources?.ph || (prediction_inputs.has_soil_health_card ? "Soil Health Card" : "Estimated (No Soil Health Card)")}</strong></span>
              <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 cursor-help ml-1" />
            </div>
          </div>

          {/* 5. Temperature */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Temperature</span>
              <p className="text-2xl font-black text-slate-800 dark:text-white">{prediction_inputs.temperature}°C</p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400" title="Retrieved from the Weather module.">
              <span className="truncate">Source: <strong className="text-slate-700 dark:text-slate-200">Weather Cache</strong></span>
              <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 cursor-help ml-1" />
            </div>
          </div>

          {/* 6. Humidity */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Humidity</span>
              <p className="text-2xl font-black text-slate-800 dark:text-white">{prediction_inputs.humidity}%</p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400" title="Retrieved from the Weather module.">
              <span className="truncate">Source: <strong className="text-slate-700 dark:text-slate-200">Weather Cache</strong></span>
              <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 cursor-help ml-1" />
            </div>
          </div>

          {/* 7. Rainfall */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Rainfall</span>
              <p className="text-2xl font-black text-slate-800 dark:text-white">{prediction_inputs.rainfall} <span className="text-xs font-normal text-slate-400">mm</span></p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400" title="Retrieved from the Weather module.">
              <span className="truncate">Source: <strong className="text-slate-700 dark:text-slate-200">Weather Cache</strong></span>
              <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 cursor-help ml-1" />
            </div>
          </div>

          {/* 8. Soil Type */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Soil Type</span>
              <p className={`text-lg font-bold capitalize ${prediction_inputs.soil_type && prediction_inputs.soil_type !== 'Unknown' ? 'text-slate-800 dark:text-white' : 'text-amber-500'}`}>
                {prediction_inputs.soil_type || 'Unknown'}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400" title="Entered while creating the farm.">
              <span className="truncate">Source: <strong className="text-slate-700 dark:text-slate-200">{prediction_inputs.soil_type && prediction_inputs.soil_type !== 'Unknown' ? "Farm Information" : "Not Provided"}</strong></span>
              <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 cursor-help ml-1" />
            </div>
          </div>

          {/* 9. Water Availability */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Water Availability</span>
              <p className={`text-lg font-bold capitalize ${prediction_inputs.water_availability && prediction_inputs.water_availability !== 'Unknown' ? 'text-slate-800 dark:text-white' : 'text-amber-500'}`}>
                {prediction_inputs.water_availability || 'Unknown'}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400" title="Entered while creating the farm.">
              <span className="truncate">Source: <strong className="text-slate-700 dark:text-slate-200">{prediction_inputs.water_availability && prediction_inputs.water_availability !== 'Unknown' ? "Farm Information" : "Not Provided"}</strong></span>
              <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 cursor-help ml-1" />
            </div>
          </div>

          {/* 10. Water Requirement */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Water Requirement</span>
              <p className="text-2xl font-black text-slate-800 dark:text-white">{prediction_inputs.water_requirement} <span className="text-xs font-normal text-slate-400">mm</span></p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400" title="Retrieved from the Crop Recommendation dataset.">
              <span className="truncate">Source: <strong className="text-slate-700 dark:text-slate-200">Crop Dataset</strong></span>
              <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 cursor-help ml-1" />
            </div>
          </div>

        </div>
      </motion.div>

      {/* SECTION 3: Yield Prediction */}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-[2.5rem] p-8 md:p-10 bg-gradient-to-br from-emerald-600 via-teal-600 to-slate-900 text-white shadow-2xl shadow-emerald-500/20 relative overflow-hidden"
      >
        <div className="relative z-10 space-y-6">
          <div className="flex justify-between items-center">
            <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full font-bold text-xs uppercase tracking-wider text-emerald-100">
              Expected Harvest Results
            </span>
            <span className="text-xs font-semibold text-emerald-200">
              Respecting Original Unit: {crop_info.farm_area_unit}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {/* Yield per Unit Area */}
            <div className="bg-black/30 backdrop-blur-md rounded-3xl p-6 border border-white/10 flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 mb-2">Harvest Rate</span>
              <div>
                <p className="text-5xl font-black text-white tracking-tight mb-1">
                  {yield_prediction.yield_per_unit_area}
                </p>
                <p className="text-lg font-bold text-emerald-300">
                  {yield_prediction.unit_label}
                </p>
              </div>
              <p className="text-xs text-white/60 mt-4 border-t border-white/10 pt-3">
                Calculated for 1 {crop_info.farm_area_unit} of farm land
              </p>
            </div>

            {/* Total Expected Yield */}
            <div className="bg-emerald-400/20 backdrop-blur-md rounded-3xl p-6 border border-emerald-400/30 flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 mb-2">Total Expected Harvest</span>
              <div>
                <p className="text-5xl font-black text-amber-300 tracking-tight mb-1">
                  {yield_prediction.total_expected_yield}
                </p>
                <p className="text-lg font-bold text-amber-200">
                  {yield_prediction.total_unit_label} (for {crop_info.farm_area} {crop_info.farm_area_unit})
                </p>
              </div>
              <p className="text-xs text-emerald-100 mt-4 border-t border-emerald-400/20 pt-3">
                Total yield across entire {crop_info.farm_area} {crop_info.farm_area_unit} farm
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* SECTION 4: Yield Analysis */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="saas-card p-6 md:p-8"
      >
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-indigo-500" /> Harvest Breakdown
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex items-start gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Soil Health</span>
              <p className="font-extrabold text-slate-800 dark:text-white text-base">{yield_analysis.soil_health}</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex items-start gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
              <Thermometer className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Weather Suitability</span>
              <p className="font-extrabold text-slate-800 dark:text-white text-base">{yield_analysis.weather_suitability}</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex items-start gap-4">
            <div className="p-3 bg-cyan-500/10 text-cyan-500 rounded-xl">
              <Droplets className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Water Availability</span>
              <p className="font-extrabold text-slate-800 dark:text-white text-base capitalize">{yield_analysis.water_availability}</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex items-start gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Yield Category</span>
              <p className="font-extrabold text-slate-800 dark:text-white text-base">{yield_analysis.yield_category}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase block mb-1">Expected Performance</span>
          <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{yield_analysis.expected_performance}</p>
        </div>
      </motion.div>

      {/* SECTION 5: Recommendations */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="saas-card p-6 md:p-8"
      >
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Info className="w-5 h-5 text-emerald-500" /> Advice for Better Growth
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {recommendations.map((rec, i) => (
            <div key={i} className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{rec}</p>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  );
};

export default YieldPrediction;
