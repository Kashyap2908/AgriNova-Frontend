import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FarmContext } from '../context/FarmContext';
import { motion } from 'framer-motion';
import { Map, Leaf, Scale, MapPin, Sprout, ArrowRight } from 'lucide-react';

const AddFarm = () => {
  const { addFarm, farms } = useContext(FarmContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    area: '',
    soil: 'Black Soil',
    crop: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    addFarm({
      name: formData.name,
      location: formData.location,
      area: `${formData.area} Acres`,
      soil: formData.soil,
      crop: formData.crop
    });
    
    // Redirect to dashboard after adding
    navigate('/dashboard');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      
      {/* Header */}
      <div className="mb-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-bold text-sm mb-4"
        >
          <Leaf className="w-4 h-4" />
          {farms.length === 0 ? "Onboarding Step 2 of 2" : "Expand Your Operations"}
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4"
        >
          {farms.length === 0 ? "Let's map your first farm." : "Add a New Farm."}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl"
        >
          Provide the physical details of your land. AgriNova will use this data to generate hyper-local weather models and soil-specific AI recommendations.
        </motion.p>
      </div>

      {/* Form Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="saas-card p-8 sm:p-10"
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Farm Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Map className="w-5 h-5 text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Green Valley Plot" 
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Location (City, State)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin className="w-5 h-5 text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Bhopal, Madhya Pradesh" 
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Total Area (Acres)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Scale className="w-5 h-5 text-slate-400" />
                  </div>
                  <input 
                    type="number" 
                    name="area"
                    required
                    min="1"
                    value={formData.area}
                    onChange={handleChange}
                    placeholder="e.g. 15" 
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Primary Soil Type</label>
                <div className="relative">
                  <select 
                    name="soil"
                    value={formData.soil}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white appearance-none cursor-pointer"
                  >
                    <option value="Black Soil">Black Soil</option>
                    <option value="Alluvial Soil">Alluvial Soil</option>
                    <option value="Red Soil">Red Soil</option>
                    <option value="Laterite Soil">Laterite Soil</option>
                    <option value="Desert Soil">Desert Soil</option>
                  </select>
                </div>
                <p className="text-xs text-slate-500 mt-2">Required for accurate fertilizer recommendations.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Current/Planned Crop</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Sprout className="w-5 h-5 text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    name="crop"
                    required
                    value={formData.crop}
                    onChange={handleChange}
                    placeholder="e.g. Cotton, Soybean, Wheat" 
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-6">
                <button 
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-0.5 active:scale-95"
                >
                  {farms.length === 0 ? "Complete Setup & Launch Dashboard" : "Add Farm"} 
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

        </form>
      </motion.div>
    </div>
  );
};

export default AddFarm;
