import { createContext, useContext, useState, useMemo, useCallback } from 'react';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // Global state for selected unit types (for rent filtering) - supports multiple selections
  const [selectedUnitTypes, setSelectedUnitTypes] = useState(['1_bedroom']); // Default: 1 bedroom

  // Global state for selected neighbourhood
  const [selectedNeighbourhood, setSelectedNeighbourhood] = useState(null);

  // Global state for data layer visibility
  const [visibleLayers, setVisibleLayers] = useState({
    crime: true,
    rent: true,
    schools: true,
    parks: true
  });

  // Toggle layer visibility (memoized to prevent recreation)
  const toggleLayer = useCallback((layerName) => {
    setVisibleLayers(prev => ({
      ...prev,
      [layerName]: !prev[layerName]
    }));
  }, []);

  // Toggle unit type selection (memoized to prevent recreation)
  const toggleUnitType = useCallback((unitType) => {
    setSelectedUnitTypes(prev => {
      if (prev.includes(unitType)) {
        // Uncheck - but keep at least one selected
        return prev.length > 1 ? prev.filter(t => t !== unitType) : prev;
      } else {
        // Check - add to selection
        return [...prev, unitType];
      }
    });
  }, []);

  // Memoize value object to prevent unnecessary re-renders
  const value = useMemo(() => ({
    selectedUnitTypes,
    toggleUnitType,
    selectedNeighbourhood,
    setSelectedNeighbourhood,
    visibleLayers,
    toggleLayer
  }), [selectedUnitTypes, selectedNeighbourhood, visibleLayers, toggleUnitType, toggleLayer]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
