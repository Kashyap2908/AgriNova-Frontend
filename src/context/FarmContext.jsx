import React, { createContext, useState, useEffect } from 'react';
import { fetchFarms, selectFarmApi } from '../services/api';

export const FarmContext = createContext();

export const FarmProvider = ({ children }) => {
  const [farms, setFarms] = useState(() => {
    try {
      const saved = localStorage.getItem('agrinova_farms');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [selectedFarm, setSelectedFarm] = useState(() => {
    try {
      const savedId = localStorage.getItem('agrinova_selected_farm_id');
      const savedFarms = JSON.parse(localStorage.getItem('agrinova_farms') || '[]');
      if (savedId && savedFarms.length > 0) {
        const found = savedFarms.find(f => f.id === parseInt(savedId));
        return found || savedFarms[0];
      }
      return savedFarms[0] || null;
    } catch (e) {
      return null;
    }
  });

  // Fetch farms from backend on mount or login
  useEffect(() => {
    const loadBackendFarms = async () => {
      const token = localStorage.getItem('access_token');
      if (token && token !== 'mock_access_token') {
        const res = await fetchFarms();
        const farmList = res?.data || res || [];
        if (Array.isArray(farmList) && farmList.length > 0) {
          const mappedFarms = farmList.map(f => ({
            id: f.id,
            name: f.farm_name || f.name || 'Unnamed Farm',
            state: f.state || '',
            district: f.district || '',
            taluka: f.taluka || '',
            village: f.village || '',
            pinCode: f.pincode || f.pinCode || '',
            area: f.farm_area || f.area || '0',
            areaUnit: f.area_unit || f.areaUnit || 'Acres',
            soil: f.soil_type || f.soil || 'Black Soil',
            soilType: f.soil_type || f.soilType || 'Black Soil',
            irrigation: f.irrigation_type || f.irrigation || 'Drip Irrigation',
            irrigationType: f.irrigation_type || f.irrigationType || 'Drip Irrigation',
            waterAvailability: f.water_availability || f.waterAvailability || 'Seasonal',
            latitude: f.latitude,
            longitude: f.longitude,
            location: f.location || `${f.village || ''}, ${f.district || ''}, ${f.state || ''}`.replace(/^, |, $/g, ''),
            is_active: f.is_active || false,
            createdAt: f.created_at || new Date().toISOString()
          }));

          setFarms(mappedFarms);
          const activeFarm = mappedFarms.find(f => f.is_active) || mappedFarms[0];
          if (activeFarm) setSelectedFarm(activeFarm);
        }
      }
    };

    loadBackendFarms();
  }, []);

  // Sync state to localStorage whenever farms or selectedFarm change
  useEffect(() => {
    localStorage.setItem('agrinova_farms', JSON.stringify(farms));
    if (selectedFarm) {
      localStorage.setItem('agrinova_selected_farm_id', selectedFarm.id.toString());
    } else if (farms.length > 0) {
      setSelectedFarm(farms[0]);
      localStorage.setItem('agrinova_selected_farm_id', farms[0].id.toString());
    } else {
      localStorage.removeItem('agrinova_selected_farm_id');
    }
  }, [farms, selectedFarm]);

  // Select farm by ID
  const selectFarm = (farmId) => {
    const numericId = parseInt(farmId);
    const farm = farms.find(f => f.id === numericId);
    if (farm) {
      setSelectedFarm(farm);
      setFarms(prev => prev.map(f => ({ ...f, is_active: f.id === numericId })));
      selectFarmApi(numericId).catch(err => console.warn('API select farm error:', err));
    }
  };

  const changeFarm = (farmId) => {
    selectFarm(farmId);
  };

  // Add a new farm
  const addFarm = (newFarmData) => {
    const farm = {
      id: Date.now(),
      name: newFarmData.name || 'Unnamed Farm',
      state: newFarmData.state || '',
      district: newFarmData.district || '',
      taluka: newFarmData.taluka || '',
      village: newFarmData.village || '',
      pinCode: newFarmData.pinCode || '',
      area: newFarmData.area || '0',
      areaUnit: newFarmData.areaUnit || 'Acres',
      soil: newFarmData.soil || newFarmData.soilType || 'Black Soil',
      soilType: newFarmData.soilType || newFarmData.soil || 'Black Soil',
      irrigation: newFarmData.irrigation || newFarmData.irrigationType || 'Drip Irrigation',
      irrigationType: newFarmData.irrigationType || newFarmData.irrigation || 'Drip Irrigation',
      waterAvailability: newFarmData.waterAvailability || 'Moderate / Seasonal',
      location: newFarmData.location || `${newFarmData.village || ''}, ${newFarmData.district || ''}, ${newFarmData.state || ''}`.replace(/^, |, $/g, ''),
      health: 'Good',
      createdAt: new Date().toISOString()
    };

    setFarms(prev => {
      const updated = [...prev, farm];
      return updated;
    });

    // Set as selected if it's the only farm or explicitly requested
    setSelectedFarm(farm);
    return farm;
  };

  // Edit an existing farm
  const editFarm = (farmId, updatedData) => {
    const numericId = parseInt(farmId);
    setFarms(prev => prev.map(f => {
      if (f.id === numericId) {
        const updated = {
          ...f,
          ...updatedData,
          location: updatedData.location || `${updatedData.village || f.village}, ${updatedData.district || f.district}, ${updatedData.state || f.state}`
        };
        if (selectedFarm && selectedFarm.id === numericId) {
          setSelectedFarm(updated);
        }
        return updated;
      }
      return f;
    }));
  };

  // Delete a farm
  const deleteFarm = (farmId) => {
    const numericId = parseInt(farmId);
    setFarms(prev => {
      const remaining = prev.filter(f => f.id !== numericId);
      if (selectedFarm && selectedFarm.id === numericId) {
        setSelectedFarm(remaining.length > 0 ? remaining[0] : null);
      }
      return remaining;
    });
  };

  return (
    <FarmContext.Provider value={{ farms, selectedFarm, changeFarm, selectFarm, addFarm, editFarm, deleteFarm }}>
      {children}
    </FarmContext.Provider>
  );
};

