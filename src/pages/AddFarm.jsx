import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FarmContext } from '../context/farm-context';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Leaf, Scale, MapPin, Sprout, ArrowRight, ArrowLeft, Check, Compass, Droplets, Layers } from 'lucide-react';
import { createFarmApi, geocodeLocation } from '../services/api';

const AddFarm = () => {
  const { addFarm, farms } = useContext(FarmContext);
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Farm Information
    name: '',
    area: '',
    areaUnit: 'Acres',

    // Step 2: Location (No Lat/Lng fields)
    state: '',
    district: '',
    taluka: '',
    village: '',
    pinCode: '',

    // Step 3: Farm Details
    soilType: 'Black Soil',
    irrigationType: 'Drip Irrigation',
    waterAvailability: 'Moderate / Seasonal'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isStep1Valid = () => {
    return formData.name.trim() !== '' && formData.area !== '' && Number(formData.area) > 0;
  };

  const isStep2Valid = () => {
    return formData.state.trim() !== '' && formData.district.trim() !== '' && formData.village.trim() !== '';
  };

  const isStep3Valid = () => {
    return formData.soilType !== '' && formData.irrigationType !== '' && formData.waterAvailability !== '';
  };

  const handleNext = (e) => {
    if (e) e.preventDefault();
    if (currentStep === 1 && isStep1Valid()) setCurrentStep(2);
    else if (currentStep === 2 && isStep2Valid()) setCurrentStep(3);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isStep3Valid()) return;

    setSaving(true);

    const farmPayload = {
      name: formData.name.trim(),
      area: formData.area,
      areaUnit: formData.areaUnit,
      state: formData.state.trim(),
      district: formData.district.trim(),
      taluka: formData.taluka.trim(),
      village: formData.village.trim(),
      pinCode: formData.pinCode.trim(),
      soilType: formData.soilType,
      soil: formData.soilType,
      irrigationType: formData.irrigationType,
      irrigation: formData.irrigationType,
      waterAvailability: formData.waterAvailability,
      location: `${formData.village.trim()}, ${formData.district.trim()}, ${formData.state.trim()}`
    };

    // Asynchronously fetch geocoding in background without blocking form submission
    geocodeLocation({
      village: formData.village,
      taluka: formData.taluka,
      district: formData.district,
      state: formData.state
    }).then(coords => {
      if (coords) {
        farmPayload.lat = coords.lat;
        farmPayload.lon = coords.lon;
      }
    });

    try {
      await addFarm(farmPayload);
      setSaving(false);
      navigate('/select-farm');
    } catch (err) {
      console.error('Failed to create farm:', err);
      setSaving(false);
    }
  };

  const steps = [
    { number: 1, title: 'Farm Information', icon: Map },
    { number: 2, title: 'Farm Location', icon: MapPin },
    { number: 3, title: 'Soil & Irrigation', icon: Sprout }
  ];

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Header */}
      <div className="mb-8 text-center">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-bold text-xs mb-3"
        >
          <Leaf className="w-3.5 h-3.5 text-primary" />
          {farms.length === 0 ? "Onboarding Step 2 of 2" : "Farm Portfolio Management"}
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight"
        >
          {farms.length === 0 ? "Register Your Primary Farm" : "Add a New Farm Record"}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-slate-500 dark:text-slate-400 mt-2 text-sm sm:text-base max-w-xl mx-auto"
        >
          Step-by-step setup to record land area, location details, and soil characteristics.
        </motion.p>
      </div>

      {/* Stepper Progress Indicator */}
      <div className="mb-10">
        <div className="flex items-center justify-between relative max-w-xl mx-auto px-4">
          {/* Connector Line */}
          <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-slate-200 dark:bg-slate-800 z-0">
            <motion.div 
              className="h-full bg-primary"
              animate={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {steps.map((step) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.number;
            const isActive = currentStep === step.number;

            return (
              <div key={step.number} className="relative z-10 flex flex-col items-center">
                <motion.button 
                  type="button"
                  onClick={() => {
                    if (step.number === 1) setCurrentStep(1);
                    else if (step.number === 2 && isStep1Valid()) setCurrentStep(2);
                    else if (step.number === 3 && isStep1Valid() && isStep2Valid()) setCurrentStep(3);
                  }}
                  whileHover={{ scale: 1.05 }}
                  className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-md ${
                    isCompleted 
                      ? 'bg-primary text-white' 
                      : isActive 
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 ring-4 ring-primary/20' 
                        : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </motion.button>
                <span className={`text-xs font-bold mt-2 hidden sm:block ${isActive ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="saas-card p-6 sm:p-10"
      >
        <form onSubmit={currentStep === 3 ? handleSubmit : handleNext}>
          
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Farm Information */}
            {currentStep === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                  <h3 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                    <Map className="w-5 h-5 text-primary" /> Step 1: Basic Farm Information
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Enter the name and total land area of your farm.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                    Farm Name <span className="text-rose-500">*</span>
                  </label>
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
                      placeholder="e.g. Green Valley Agricultural Plot" 
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-8">
                    <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                      Total Area <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Scale className="w-5 h-5 text-slate-400" />
                      </div>
                      <input 
                        type="number" 
                        name="area"
                        required
                        min="0.1"
                        step="0.1"
                        value={formData.area}
                        onChange={handleChange}
                        placeholder="e.g. 12.5" 
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white font-medium"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                      Area Unit
                    </label>
                    <select 
                      name="areaUnit"
                      value={formData.areaUnit}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white font-medium cursor-pointer"
                    >
                      <option value="Acres">Acres</option>
                      <option value="Hectares">Hectares</option>
                      <option value="Bigha">Bigha</option>
                      <option value="Guntha">Guntha</option>
                      <option value="Cent">Cent</option>
                      <option value="Sq Meters">Sq Meters</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Farm Location */}
            {currentStep === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                  <h3 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" /> Step 2: Farm Administrative Location
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Provide state, district, taluka, and village details. Coordinates will be fetched asynchronously.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                      State <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="e.g. Madhya Pradesh, Maharashtra, Punjab" 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                      District <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="district"
                      required
                      value={formData.district}
                      onChange={handleChange}
                      placeholder="e.g. Bhopal, Nashik, Ludhiana" 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                      Taluka / Tehsil
                    </label>
                    <input 
                      type="text" 
                      name="taluka"
                      value={formData.taluka}
                      onChange={handleChange}
                      placeholder="e.g. Huzur, Niphad" 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                      Village <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="village"
                      required
                      value={formData.village}
                      onChange={handleChange}
                      placeholder="e.g. Khajuri, Pimpalgaon" 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                      PIN Code <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input 
                      type="text" 
                      name="pinCode"
                      value={formData.pinCode}
                      onChange={handleChange}
                      placeholder="e.g. 462001" 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Farm Details */}
            {currentStep === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                  <h3 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                    <Sprout className="w-5 h-5 text-primary" /> Step 3: Soil & Water Specifications
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Select soil classification, primary irrigation method, and water source reliability.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                    Soil Type <span className="text-rose-500">*</span>
                  </label>
                  <select 
                    name="soilType"
                    value={formData.soilType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white font-medium cursor-pointer"
                  >
                    <option value="Black Soil">Black Soil (Regur)</option>
                    <option value="Alluvial Soil">Alluvial Soil</option>
                    <option value="Red Soil">Red Soil</option>
                    <option value="Laterite Soil">Laterite Soil</option>
                    <option value="Desert / Sandy Soil">Desert / Sandy Soil</option>
                    <option value="Loamy Soil">Loamy Soil</option>
                    <option value="Clay Soil">Clay Soil</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                    Irrigation Type <span className="text-rose-500">*</span>
                  </label>
                  <select 
                    name="irrigationType"
                    value={formData.irrigationType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white font-medium cursor-pointer"
                  >
                    <option value="Drip Irrigation">Drip Irrigation</option>
                    <option value="Sprinkler Irrigation">Sprinkler Irrigation</option>
                    <option value="Surface / Flood Irrigation">Surface / Flood Irrigation</option>
                    <option value="Rainfed">Rainfed (Dependent on monsoons)</option>
                    <option value="Canal Irrigation">Canal Irrigation</option>
                    <option value="Tube Well / Borewell">Tube Well / Borewell</option>
                    <option value="Center Pivot">Center Pivot</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                    Water Availability <span className="text-rose-500">*</span>
                  </label>
                  <select 
                    name="waterAvailability"
                    value={formData.waterAvailability}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white font-medium cursor-pointer"
                  >
                    <option value="Abundant / Year-round">Abundant / Year-round</option>
                    <option value="Moderate / Seasonal">Moderate / Seasonal</option>
                    <option value="Scarce / Dependent on rain">Scarce / Dependent on rain</option>
                  </select>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Wizard Controls */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            {currentStep > 1 ? (
              <button 
                type="button" 
                onClick={handlePrevious}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-sm transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>
            ) : <div />}

            {currentStep < 3 ? (
              <button 
                type="submit" 
                disabled={currentStep === 1 ? !isStep1Valid() : !isStep2Valid()}
                className="flex items-center gap-2 px-7 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                type="submit" 
                disabled={saving || !isStep3Valid()}
                className="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>Save Farm <Check className="w-4 h-4" /></>
                )}
              </button>
            )}
          </div>

        </form>
      </motion.div>
    </div>
  );
};

export default AddFarm;

