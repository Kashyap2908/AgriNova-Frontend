import React, { createContext, useState, useEffect } from 'react';

export const FarmContext = createContext();

export const FarmProvider = ({ children }) => {
  // Load farms from localStorage if available
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

