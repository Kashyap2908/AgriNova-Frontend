import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImagePlus, ScanLine, AlertTriangle, CheckCircle2, ShieldCheck, Leaf } from 'lucide-react';
import { detectDisease } from '../services/mlService';

const DiseaseDetection = () => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
      setResult(null);
    }
  };

  const handleScan = async () => {
    if (!image) return;
    setLoading(true);
    setResult(null);
    const prediction = await detectDisease(image);
    setResult(prediction);
    setLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-12 max-w-5xl mx-auto"
    >
      <div className="mb-12 text-center">
        <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight flex justify-center items-center gap-3">
          <ScanLine className="w-10 h-10 text-amber-500" /> Plant Disease Scanner
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
          Upload a clear photo of an affected leaf. Our MobileNetV2 computer vision model will identify the disease and prescribe immediate treatment.
        </p>
      </div>

      <div className="bg-slate-900 dark:bg-slate-800 rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        {/* Abstract Background for Scanner */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
          
          {/* Upload Area */}
          <div className="w-full md:w-1/2">
            {!image ? (
              <label className="w-full h-80 border-4 border-dashed border-slate-700 hover:border-amber-500 rounded-[2rem] bg-slate-800/50 flex flex-col items-center justify-center text-slate-400 transition-all cursor-pointer hover:bg-amber-500/5 group relative">
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform group-hover:bg-amber-500/20 group-hover:text-amber-400 shadow-xl">
                  <ImagePlus className="w-12 h-12" />
                </div>
                <span className="text-2xl font-bold text-white mb-2">Select Leaf Image</span>
                <span className="text-slate-400 font-medium">Click to browse or drag & drop</span>
              </label>
            ) : (
              <div className="w-full h-80 relative rounded-[2rem] overflow-hidden border-4 border-slate-700 shadow-2xl">
                <img src={image} alt="Uploaded Leaf" className="w-full h-full object-cover" />
                {loading && (
                  <>
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-10"></div>
                    <motion.div 
                      initial={{ top: 0 }}
                      animate={{ top: '100%' }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 w-full h-1 bg-amber-500 shadow-[0_0_20px_rgb(245,158,11)] z-20"
                    ></motion.div>
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white">
                      <ScanLine className="w-12 h-12 text-amber-500 mb-4 animate-pulse" />
                      <span className="font-bold text-xl">Analyzing specific patterns...</span>
                    </div>
                  </>
                )}
                {!loading && (
                  <button 
                    onClick={() => setImage(null)}
                    className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors z-30"
                  >
                    Change Image
                  </button>
                )}
              </div>
            )}

            {!loading && image && !result && (
              <button 
                onClick={handleScan}
                className="mt-6 w-full py-4 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-lg rounded-xl shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-1"
              >
                <ScanLine className="w-6 h-6" /> Run AI Diagnosis
              </button>
            )}
          </div>

          {/* Results Area */}
          <div className="w-full md:w-1/2">
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
                  <p className="text-lg">Upload an image and run the scanner to see the diagnosis.</p>
                </motion.div>
              )}

              {loading && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full flex flex-col items-center justify-center text-amber-500"
                >
                  <div className="w-20 h-20 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-6"></div>
                  <h3 className="text-2xl font-bold">Processing via MobileNetV2...</h3>
                </motion.div>
              )}

              {result && !loading && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="h-full flex flex-col justify-center"
                >
                  {result.disease === 'Healthy' ? (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full font-bold text-sm mb-6 w-max">
                      <ShieldCheck className="w-5 h-5" /> All Clear
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full font-bold text-sm mb-6 w-max">
                      <AlertTriangle className="w-5 h-5" /> Disease Detected
                    </div>
                  )}
                  
                  <p className="text-slate-400 font-medium uppercase tracking-widest text-sm mb-2">Diagnosis</p>
                  <h3 className={`text-5xl font-extrabold mb-6 tracking-tight ${result.disease === 'Healthy' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {result.disease}
                  </h3>

                  <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-white">Confidence Score</span>
                      <span className="font-bold text-xl text-amber-400">{result.confidence}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 mt-2">
                      <div className="bg-amber-400 h-2 rounded-full" style={{ width: `${result.confidence}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
                    <h4 className="text-blue-400 font-bold mb-2 text-lg">Prescribed Treatment</h4>
                    <p className="text-slate-300 leading-relaxed text-lg">
                      {result.treatment}
                    </p>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DiseaseDetection;
