import React, { createContext, useState, useEffect, useContext } from 'react';
import api, { fetchFarms, selectFarmApi, createFarmApi, deleteFarmApi } from '../services/api';
import { AuthContext } from './AuthContext';

export const FarmContext = createContext();

export const FarmProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  const [farms, setFarms] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState(null);

  // Helper to extract farm list from any response payload format
  const extractFarmList = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.farms)) return res.farms;
    if (res.data && Array.isArray(res.data.farms)) return res.data.farms;
    if (res.data && Array.isArray(res.data.data)) return res.data.data;
    return [];
  };

  // Mapper function to ensure full field compatibility
  const mapFarm = (f) => ({
    id: f.id,
    name: f.farm_name || f.name || 'Unnamed Farm',
    farm_name: f.farm_name || f.name || 'Unnamed Farm',
    state: f.state || '',
    district: f.district || '',
    taluka: f.taluka || '',
    village: f.village || '',
    pinCode: f.pincode || f.pinCode || '',
    pincode: f.pincode || f.pinCode || '',
    area: f.farm_area !== undefined && f.farm_area !== null ? String(f.farm_area) : (f.area ? String(f.area) : '0'),
    farm_area: f.farm_area !== undefined && f.farm_area !== null ? String(f.farm_area) : (f.area ? String(f.area) : '0'),
    areaUnit: f.area_unit || f.areaUnit || 'Acres',
    area_unit: f.area_unit || f.areaUnit || 'Acres',
    soil: f.soil_type || f.soil || 'Black Soil',
    soilType: f.soil_type || f.soilType || 'Black Soil',
    soil_type: f.soil_type || f.soilType || 'Black Soil',
    irrigation: f.irrigation_type || f.irrigation || 'Drip Irrigation',
    irrigationType: f.irrigation_type || f.irrigationType || 'Drip Irrigation',
    irrigation_type: f.irrigation_type || f.irrigationType || 'Drip Irrigation',
    waterAvailability: f.water_availability || f.waterAvailability || 'Moderate / Seasonal',
    water_availability: f.water_availability || f.waterAvailability || 'Moderate / Seasonal',
    latitude: f.latitude,
    longitude: f.longitude,
    location: `${f.village || ''}, ${f.district || ''}, ${f.state || ''}`.replace(/^, |, $/g, ''),
    is_active: Boolean(f.is_active),
    createdAt: f.created_at || new Date().toISOString()
  });

  // Re-fetch all farm records directly from SQLite backend
  const refreshFarms = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setFarms([]);
      setSelectedFarm(null);
      return [];
    }

    try {
      const res = await fetchFarms();
      const rawList = extractFarmList(res);
      const mappedFarms = rawList.map(mapFarm);

      setFarms(mappedFarms);
      
      const activeFarm = mappedFarms.find(f => f.is_active) || mappedFarms[0] || null;
      setSelectedFarm(activeFarm);

      return mappedFarms;
    } catch (error) {
      console.error('Failed to refresh farms from backend:', error);
      setFarms([]);
      setSelectedFarm(null);
      return [];
    }
  };

  // Re-sync farms whenever AuthContext user changes (Login, Logout, Startup, Profile load)
  useEffect(() => {
    if (user) {
      refreshFarms();
    } else {
      setFarms([]);
      setSelectedFarm(null);
    }
  }, [user]);

  // Select farm by ID (API call followed by SQLite state refresh)
  const selectFarm = async (farmId) => {
    const numericId = parseInt(farmId);
    try {
      await selectFarmApi(numericId);
    } catch (err) {
      console.error('API select farm error:', err);
    }
    return await refreshFarms();
  };

  const changeFarm = async (farmId) => {
    return await selectFarm(farmId);
  };

  // Add new farm (API call followed by SQLite state refresh)
  const addFarm = async (newFarmData) => {
    try {
      await createFarmApi(newFarmData);
    } catch (err) {
      console.error('API create farm error:', err);
      throw err;
    }
    return await refreshFarms();
  };

  // Edit existing farm (API call followed by SQLite state refresh)
  const editFarm = async (farmId, updatedData) => {
    const numericId = parseInt(farmId);
    try {
      await api.put(`/farms/${numericId}/`, updatedData);
    } catch (err) {
      console.error('API edit farm error:', err);
      throw err;
    }
    return await refreshFarms();
  };

  // Delete farm (API call followed by SQLite state refresh)
  const deleteFarm = async (farmId) => {
    const numericId = parseInt(farmId);
    try {
      await deleteFarmApi(numericId);
    } catch (err) {
      console.error('API delete farm error:', err);
    }
    return await refreshFarms();
  };

  return (
    <FarmContext.Provider value={{ farms, selectedFarm, changeFarm, selectFarm, addFarm, editFarm, deleteFarm, refreshFarms }}>
      {children}
    </FarmContext.Provider>
  );
};
