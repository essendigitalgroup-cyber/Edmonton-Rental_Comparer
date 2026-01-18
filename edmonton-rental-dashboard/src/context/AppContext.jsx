import { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // Global state for active unit type (for rent filtering)
  const [activeUnitType, setActiveUnitType] = useState('total_avg');

  // Global state for selected neighbourhood
  const [selectedNeighbourhood, setSelectedNeighbourhood] = useState(null);

  // Global state for data layer visibility
  const [visibleLayers, setVisibleLayers] = useState({
    crime: true,
    rent: true,
    schools: true,
    parks: true
  });

  // Toggle layer visibility
  const toggleLayer = (layerName) => {
    setVisibleLayers(prev => ({
      ...prev,
      [layerName]: !prev[layerName]
    }));
  };

  const value = {
    activeUnitType,
    setActiveUnitType,
    selectedNeighbourhood,
    setSelectedNeighbourhood,
    visibleLayers,
    toggleLayer
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
