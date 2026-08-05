import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ImagePlus, ScanLine, AlertTriangle, CheckCircle2, ShieldCheck, Leaf, 
  Droplets, ThermometerSun, TestTube, Sprout, ShieldAlert, FileText, AlertCircle, RefreshCw
} from 'lucide-react';
import { detectDisease } from '../services/mlService';

const InfoCard = ({ icon: Icon, title, content, colorClass = "text-amber-500", bgClass = "bg-amber-500/10" }) => {
  if (!content || content === "N/A") return null;
  return (
    <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 hover:bg-slate-800 transition-colors">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${bgClass} ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-slate-400 font-semibold text-sm uppercase tracking-wider mb-1">{title}</h4>
          <p className="text-slate-200 leading-relaxed text-sm">{content}</p>
        </div>
      </div>
    </div>
  );
};

const DiseaseDetection = () => {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size exceeds 5MB limit. Please upload a smaller image.");
        return;
      }
      
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setImageFile(file);
      setResult(null);
      setError(null);
    }
  };

  const handleScan = async () => {
    if (!imageFile) return;
    setLoading(true);
    setResult(null);
    setError(null);
    
    const prediction = await detectDisease(imageFile);
    
    if (prediction.success) {
      setResult(prediction);
    } else {
      setError(prediction.error || "Failed to process image. Please try again.");
    }
    
    setLoading(false);
  };

  const resetScanner = () => {
    setImagePreview(null);
    setImageFile(null);
    setResult(null);
    setError(null);
  };

  const isHealthy = result?.status === 'Healthy';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-12 px-4 max-w-7xl mx-auto"
    >
      <div className="mb-12 text-center">
        <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight flex justify-center items-center gap-3">
          <ScanLine className="w-10 h-10 text-emerald-500" /> Check Crop Disease
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
          Upload a clear photo of a sick leaf. We will tell you the disease and how to treat it.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Scanner Area */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <div className="bg-slate-900 dark:bg-slate-800 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden h-[500px] flex flex-col border border-slate-700/50">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 flex-1 flex flex-col">
              {!imagePreview ? (
                <label className="flex-1 w-full border-4 border-dashed border-slate-700 hover:border-emerald-500 rounded-[1.5rem] bg-slate-800/50 flex flex-col items-center justify-center text-slate-400 transition-all cursor-pointer hover:bg-emerald-500/5 group">
                  <input type="file" className="hidden" accept="image/jpeg, image/png, image/jpg" capture="environment" onChange={handleImageUpload} />
                  <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform group-hover:bg-emerald-500/20 group-hover:text-emerald-400 shadow-xl">
                    <ImagePlus className="w-10 h-10" />
                  </div>
                  <span className="text-xl font-bold text-white mb-2">Select Leaf Image</span>
                  <span className="text-slate-400 text-sm font-medium">JPG or PNG (Max 5MB)</span>
                </label>
              ) : (
                <div className="flex-1 w-full relative rounded-[1.5rem] overflow-hidden border-4 border-slate-700 shadow-2xl bg-black">
                  <img src={imagePreview} alt="Uploaded Leaf" className="w-full h-full object-contain" />
                  
                  {loading && (
                    <>
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-10"></div>
                      <motion.div 
                        initial={{ top: 0 }}
                        animate={{ top: '100%' }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 w-full h-1 bg-emerald-500 shadow-[0_0_20px_rgb(16,185,129)] z-20"
                      ></motion.div>
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white">
                        <ScanLine className="w-12 h-12 text-emerald-500 mb-4 animate-pulse" />
                        <span className="font-bold text-lg text-center px-4">Analyzing cell structure via EfficientNetB0...</span>
                      </div>
                    </>
                  )}
                  
                  {!loading && (
                    <button 
                      onClick={resetScanner}
                      className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md text-white p-2 rounded-xl text-sm font-semibold hover:bg-rose-500 transition-colors z-30 shadow-lg"
                      title="Remove Image"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <p className="text-rose-400 text-sm">{error}</p>
                </div>
              )}

              {!loading && imagePreview && !result && !error && (
                <button 
                  onClick={handleScan}
                  className="mt-6 w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold text-lg rounded-xl shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-1"
                >
                  <ScanLine className="w-6 h-6" /> Run AI Diagnosis
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Results Dashboard */}
        <div className="w-full lg:w-2/3">
          <div className="bg-slate-900 dark:bg-slate-800 rounded-[2rem] p-6 md:p-8 shadow-2xl relative border border-slate-700/50 h-[500px] flex flex-col">
            
            <AnimatePresence mode="wait">
              {!result && !loading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center text-slate-500 text-center"
                >
                  <Leaf className="w-24 h-24 mb-6 opacity-20" />
                  <h3 className="text-2xl font-bold mb-2 text-slate-400">Awaiting Image</h3>
                  <p className="text-lg max-w-sm">Upload an image and run the scanner to generate a complete agricultural report.</p>
                </motion.div>
              )}

              {loading && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full flex flex-col items-center justify-center text-emerald-500"
                >
                  <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-6"></div>
                  <h3 className="text-xl font-bold">Querying Database...</h3>
                </motion.div>
              )}

              {result && !loading && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="h-full flex flex-col overflow-hidden"
                >
                  {/* Top Bar Summary */}
                  <div className="flex flex-wrap md:flex-nowrap justify-between items-start gap-4 mb-6 pb-6 border-b border-slate-700">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        {isHealthy ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full font-bold text-xs">
                            <ShieldCheck className="w-4 h-4" /> Healthy
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full font-bold text-xs">
                            <AlertTriangle className="w-4 h-4" /> Diseased
                          </span>
                        )}
                        <span className="text-slate-400 text-sm font-semibold px-3 py-1 bg-slate-800 rounded-full">
                          {result.crop}
                        </span>
                      </div>
                      <h3 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${isHealthy ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {result.disease}
                      </h3>
                    </div>
                    
                    <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 min-w-[150px] shrink-0">
                      <div className="text-slate-400 text-xs font-bold uppercase mb-1">AI Confidence</div>
                      <div className="flex items-end gap-2 mb-2">
                        <span className="text-2xl font-bold text-emerald-400 leading-none">{result.confidence}</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5">
                        <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: result.confidence }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Scrollable Content Area */}
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    
                    {/* Healthy Layout */}
                    {isHealthy ? (
                      <div className="space-y-4">
                        <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                          <h4 className="text-emerald-400 font-bold text-lg mb-2 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5" /> Excellent Health
                          </h4>
                          <p className="text-slate-300 text-lg leading-relaxed">{result.symptoms}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoCard icon={ShieldCheck} title="Prevention" content={result.prevention} colorClass="text-emerald-400" bgClass="bg-emerald-500/10" />
                          <InfoCard icon={Sprout} title="Farmer Action" content={result.farmer_action} colorClass="text-emerald-400" bgClass="bg-emerald-500/10" />
                          <InfoCard icon={FileText} title="Govt Recommendation" content={result.government_recommendation} colorClass="text-blue-400" bgClass="bg-blue-500/10" />
                        </div>
                      </div>
                    ) : (
                      /* Diseased Layout */
                      <div className="space-y-8 pb-6">
                        
                        {/* Section 1: Diagnosis Details */}
                        <div>
                          <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2 border-b border-slate-700 pb-2">
                            <AlertCircle className="w-5 h-5 text-rose-400" /> Diagnosis Profile
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoCard icon={FileText} title="Scientific Name" content={result.scientific_name} colorClass="text-slate-400" bgClass="bg-slate-700" />
                            <InfoCard icon={AlertTriangle} title="Severity" content={result.severity} colorClass="text-rose-400" bgClass="bg-rose-500/10" />
                            <InfoCard icon={Leaf} title="Affected Part" content={result.affected_part} colorClass="text-amber-500" bgClass="bg-amber-500/10" />
                            <InfoCard icon={ThermometerSun} title="Favorable Weather" content={result.weather_conditions} colorClass="text-blue-400" bgClass="bg-blue-500/10" />
                          </div>
                          
                          {(result.symptoms !== "N/A" || result.causes !== "N/A") && (
                            <div className="mt-4 p-5 bg-slate-800 rounded-2xl border border-slate-700">
                              {result.symptoms !== "N/A" && (
                                <div className="mb-4">
                                  <strong className="text-slate-300 block mb-1">Symptoms:</strong>
                                  <p className="text-slate-400 text-sm leading-relaxed">{result.symptoms}</p>
                                </div>
                              )}
                              {result.causes !== "N/A" && (
                                <div>
                                  <strong className="text-slate-300 block mb-1">Causes:</strong>
                                  <p className="text-slate-400 text-sm leading-relaxed">{result.causes}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Section 2: Treatment Plan */}
                        <div>
                          <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2 border-b border-slate-700 pb-2">
                            <TestTube className="w-5 h-5 text-indigo-400" /> Treatment Plan
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-2xl p-5">
                              <h5 className="text-emerald-400 font-bold mb-2 flex items-center gap-2"><Sprout className="w-4 h-4"/> Organic Treatment</h5>
                              <p className="text-slate-300 text-sm leading-relaxed">{result.organic_treatment}</p>
                            </div>
                            <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-2xl p-5">
                              <h5 className="text-indigo-400 font-bold mb-2 flex items-center gap-2"><TestTube className="w-4 h-4"/> Chemical Treatment</h5>
                              <p className="text-slate-300 text-sm leading-relaxed">{result.chemical_treatment}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <InfoCard icon={TestTube} title="Active Ingredient" content={result.recommended_active_ingredient} colorClass="text-indigo-400" bgClass="bg-indigo-500/10" />
                            <InfoCard icon={Droplets} title="Dosage" content={result.dosage} colorClass="text-blue-400" bgClass="bg-blue-500/10" />
                            <InfoCard icon={RefreshCw} title="Spray Interval" content={result.spray_interval} colorClass="text-emerald-400" bgClass="bg-emerald-500/10" />
                          </div>
                        </div>

                        {/* Section 3: Action Plan & Analytics */}
                        <div>
                          <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2 border-b border-slate-700 pb-2">
                            <ShieldAlert className="w-5 h-5 text-amber-400" /> Analytics & Action
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoCard icon={AlertCircle} title="Immediate Action" content={result.farmer_action} colorClass="text-rose-400" bgClass="bg-rose-500/10" />
                            <InfoCard icon={ShieldCheck} title="Prevention Tips" content={result.prevention} colorClass="text-emerald-400" bgClass="bg-emerald-500/10" />
                            
                            {result.estimated_yield_loss !== "N/A" && (
                              <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 flex items-center justify-between">
                                <div>
                                  <h4 className="text-slate-400 font-semibold text-sm uppercase mb-1">Est. Yield Loss</h4>
                                  <p className="text-rose-400 font-bold text-xl">{result.estimated_yield_loss}</p>
                                </div>
                                <div className="text-right">
                                  <h4 className="text-slate-400 font-semibold text-sm uppercase mb-1">Recovery</h4>
                                  <p className="text-slate-200 text-sm">{result.recovery_possible}</p>
                                </div>
                              </div>
                            )}

                            <InfoCard icon={FileText} title="Govt Recommendation" content={result.government_recommendation} colorClass="text-amber-500" bgClass="bg-amber-500/10" />
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                  
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Required CSS for custom scrollbar embedded locally to component */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(71, 85, 105, 0.8);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 1);
        }
      `}} />
    </motion.div>
  );
};

export default DiseaseDetection;
