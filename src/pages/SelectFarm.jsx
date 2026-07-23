import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FarmContext } from '../context/FarmContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, PlusSquare, MapPin, Scale, Layers, Droplets, Edit3, Trash2, 
  ArrowRight, ShieldCheck, AlertTriangle, X, Check, Sprout, Map
} from 'lucide-react';
import { deleteFarmApi } from '../services/api';

const SelectFarm = () => {
  const { farms, selectedFarm, selectFarm, editFarm, deleteFarm } = useContext(FarmContext);
  const navigate = useNavigate();

  // Modal States
  const [deleteModalId, setDeleteModalId] = useState(null);
  const [editingFarm, setEditingFarm] = useState(null);

  const handleSelectFarm = (farmId) => {
    selectFarm(farmId);
    navigate('/dashboard');
  };

  const handleDeleteConfirm = async () => {
    if (deleteModalId) {
      await deleteFarmApi(deleteModalId);
      deleteFarm(deleteModalId);
      setDeleteModalId(null);
    }
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (editingFarm) {
      editFarm(editingFarm.id, editingFarm);
      setEditingFarm(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-bold text-xs mb-3">
            <Map className="w-3.5 h-3.5 text-primary" />
            Farm Selection & Management
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Registered Farms
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm sm:text-base">
            Select an active farm to view dashboard metrics, or add/manage existing properties.
          </p>
        </div>

        <Link 
          to="/add-farm" 
          className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-0.5 active:scale-95 text-sm"
        >
          <PlusSquare className="w-4 h-4" /> Add New Farm
        </Link>
      </div>

      {/* Farm Cards Grid */}
      {farms.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="saas-card p-12 text-center max-w-xl mx-auto flex flex-col items-center"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-slate-800 flex items-center justify-center text-primary mb-4">
            <Sprout className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-2">No Farms Registered</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
            You haven't added any farms to your AgriNova account yet. Register your first farm to access smart agricultural insights.
          </p>
          <Link 
            to="/add-farm" 
            className="flex items-center gap-2 px-8 py-3.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all"
          >
            <PlusSquare className="w-5 h-5" /> Register Your First Farm
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farms.map((farm) => {
            const isActive = selectedFarm?.id === farm.id;

            return (
              <motion.div
                key={farm.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                className={`saas-card p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-200 ${
                  isActive 
                    ? 'border-2 border-primary shadow-xl shadow-primary/10 ring-4 ring-primary/10 bg-gradient-to-b from-emerald-50/30 to-white dark:from-slate-800/80 dark:to-slate-800' 
                    : 'hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Active Indicator Badge */}
                {isActive && (
                  <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 rounded-bl-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active Farm
                  </div>
                )}

                <div>
                  {/* Farm Title & Location */}
                  <div className="mb-4 pr-16">
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                      {farm.name}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      <span className="truncate">
                        {farm.village ? `${farm.village}, ` : ''}{farm.district || ''}{farm.state ? `, ${farm.state}` : ''}
                      </span>
                    </p>
                  </div>

                  {/* Specification Cards */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5">Area</span>
                      <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <Scale className="w-3.5 h-3.5 text-primary" /> {farm.area} {farm.areaUnit || 'Acres'}
                      </span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5">Soil Type</span>
                      <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 truncate flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-primary" /> {farm.soilType || farm.soil || 'Black Soil'}
                      </span>
                    </div>
                  </div>

                  {/* Additional Meta */}
                  <div className="space-y-2 mb-6 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Irrigation:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{farm.irrigationType || farm.irrigation || 'Drip Irrigation'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Water Source:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{farm.waterAvailability || 'Seasonal'}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button 
                    onClick={() => handleSelectFarm(farm.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                      isActive 
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700' 
                        : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100'
                    }`}
                  >
                    {isActive ? (
                      <><Check className="w-3.5 h-3.5" /> Selected</>
                    ) : (
                      <><ArrowRight className="w-3.5 h-3.5" /> Select Farm</>
                    )}
                  </button>

                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setEditingFarm(farm)}
                      title="Edit Farm"
                      className="p-2.5 text-slate-500 hover:text-primary bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setDeleteModalId(farm.id)}
                      title="Delete Farm"
                      className="p-2.5 text-slate-500 hover:text-rose-600 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="saas-card max-w-md w-full p-6 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Delete Farm Record?</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                Are you sure you want to remove this farm? This action will delete farm specifications and cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteModalId(null)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-600/30 transition-colors text-sm"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Farm Modal */}
      <AnimatePresence>
        {editingFarm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="saas-card max-w-lg w-full p-6 my-8 text-left"
            >
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Edit Farm Information</h3>
                <button onClick={() => setEditingFarm(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4 text-sm">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Farm Name</label>
                  <input 
                    type="text"
                    required
                    value={editingFarm.name}
                    onChange={(e) => setEditingFarm({ ...editingFarm, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Area</label>
                    <input 
                      type="number"
                      required
                      value={editingFarm.area}
                      onChange={(e) => setEditingFarm({ ...editingFarm, area: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Unit</label>
                    <select 
                      value={editingFarm.areaUnit || 'Acres'}
                      onChange={(e) => setEditingFarm({ ...editingFarm, areaUnit: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white cursor-pointer"
                    >
                      <option value="Acres">Acres</option>
                      <option value="Hectares">Hectares</option>
                      <option value="Bigha">Bigha</option>
                      <option value="Guntha">Guntha</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">State</label>
                    <input 
                      type="text"
                      required
                      value={editingFarm.state || ''}
                      onChange={(e) => setEditingFarm({ ...editingFarm, state: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">District</label>
                    <input 
                      type="text"
                      required
                      value={editingFarm.district || ''}
                      onChange={(e) => setEditingFarm({ ...editingFarm, district: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Village</label>
                    <input 
                      type="text"
                      required
                      value={editingFarm.village || ''}
                      onChange={(e) => setEditingFarm({ ...editingFarm, village: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Soil Type</label>
                    <select 
                      value={editingFarm.soilType || editingFarm.soil || 'Black Soil'}
                      onChange={(e) => setEditingFarm({ ...editingFarm, soilType: e.target.value, soil: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white cursor-pointer"
                    >
                      <option value="Black Soil">Black Soil</option>
                      <option value="Alluvial Soil">Alluvial Soil</option>
                      <option value="Red Soil">Red Soil</option>
                      <option value="Laterite Soil">Laterite Soil</option>
                      <option value="Desert / Sandy Soil">Desert / Sandy Soil</option>
                      <option value="Loamy Soil">Loamy Soil</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setEditingFarm(null)}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2.5 bg-primary text-white font-bold rounded-xl text-xs shadow-md shadow-primary/20 hover:bg-primary-dark"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default SelectFarm;
