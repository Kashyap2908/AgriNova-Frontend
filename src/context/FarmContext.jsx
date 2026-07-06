import React, { createContext, useState, useEffect } from 'react';

export const FarmContext = createContext();

export const FarmProvider = ({ children }) => {
  // Start with 0 farms to enforce the mandatory onboarding flow
  const [farms, setFarms] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState(null);

  // When a user selects a different farm from the topbar
  const changeFarm = (farmId) => {
    const farm = farms.find(f => f.id === parseInt(farmId));
    if (farm) setSelectedFarm(farm);
  };

  // Add a new farm to the context
  const addFarm = (newFarm) => {
    const farm = {
      ...newFarm,
      id: Date.now(),
      health: 'Good' // Default mock health for new farms
    };
    
    setFarms(prev => [...prev, farm]);
    
    // Automatically select the new farm if it's the first one
    if (farms.length === 0) {
      setSelectedFarm(farm);
    }
  };

  return (
    <FarmContext.Provider value={{ farms, selectedFarm, changeFarm, addFarm }}>
      {children}
    </FarmContext.Provider>
  );
};
