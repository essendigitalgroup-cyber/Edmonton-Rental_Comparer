// Data loader utility - loads all JSON/GeoJSON data files

// Import URLs to JSON files (using ?url suffix to get file paths)
import crimeDataUrl from '../data/crime-data-processed.json?url';
import rentDataUrl from '../data/rent-data-processed.json?url';
import schoolsDataUrl from '../data/schools.geojson?url';
import parksDataUrl from '../data/parks.geojson?url';
import neighbourhoodsDataUrl from '../data/City_of_Edmonton_-_Neighbourhoods_20260117.geojson?url';

let crimeData = null;
let rentData = null;
let schoolsData = null;
let parksData = null;
let neighbourhoodsData = null;

// Lookup maps for O(1) performance
let crimeDataMap = null;
let rentDataMap = null;
let neighbourhoodDataMap = null;

// Single loading promise to prevent race conditions
let loadingPromise = null;

/**
 * Build lookup maps for O(1) performance
 */
const buildLookupMaps = () => {
  // Crime lookup map
  crimeDataMap = new Map();
  crimeData.crime_by_neighbourhood.forEach(entry => {
    crimeDataMap.set(entry.neighbourhood_name.toUpperCase(), entry);
  });

  // Rent lookup map
  rentDataMap = new Map();
  rentData.rent_by_neighbourhood.forEach(entry => {
    rentDataMap.set(entry.neighbourhood_name.toUpperCase(), entry);
  });

  // Neighbourhood lookup map
  neighbourhoodDataMap = new Map();
  neighbourhoodsData.features.forEach(feature => {
    neighbourhoodDataMap.set(feature.properties.name.toUpperCase(), feature);
  });
};

/**
 * Load all data files asynchronously with error handling and race condition prevention
 * @returns {Promise<Object>} All loaded data
 * @throws {Error} If any data file fails to load
 */
export const loadAllData = async () => {
  // Return cached data if already loaded
  if (crimeData) {
    return {
      crime: crimeData,
      rent: rentData,
      schools: schoolsData,
      parks: parksData,
      neighbourhoods: neighbourhoodsData
    };
  }

  // Return existing loading promise to prevent duplicate fetches
  if (loadingPromise) {
    return loadingPromise;
  }

  // Create new loading promise
  loadingPromise = Promise.all([
    fetch(crimeDataUrl).then(r => {
      if (!r.ok) throw new Error(`Failed to load crime data: ${r.statusText}`);
      return r.json();
    }),
    fetch(rentDataUrl).then(r => {
      if (!r.ok) throw new Error(`Failed to load rent data: ${r.statusText}`);
      return r.json();
    }),
    fetch(schoolsDataUrl).then(r => {
      if (!r.ok) throw new Error(`Failed to load schools data: ${r.statusText}`);
      return r.json();
    }),
    fetch(parksDataUrl).then(r => {
      if (!r.ok) throw new Error(`Failed to load parks data: ${r.statusText}`);
      return r.json();
    }),
    fetch(neighbourhoodsDataUrl).then(r => {
      if (!r.ok) throw new Error(`Failed to load neighbourhoods data: ${r.statusText}`);
      return r.json();
    })
  ])
    .then(([crime, rent, schools, parks, neighbourhoods]) => {
      // Validate data structure
      if (!crime?.crime_by_neighbourhood) {
        throw new Error('Invalid crime data structure');
      }
      if (!rent?.rent_by_neighbourhood) {
        throw new Error('Invalid rent data structure');
      }
      if (!schools?.features) {
        throw new Error('Invalid schools data structure');
      }
      if (!parks?.features) {
        throw new Error('Invalid parks data structure');
      }
      if (!neighbourhoods?.features) {
        throw new Error('Invalid neighbourhoods data structure');
      }

      // Cache data
      crimeData = crime;
      rentData = rent;
      schoolsData = schools;
      parksData = parks;
      neighbourhoodsData = neighbourhoods;

      // Build lookup maps for O(1) performance
      buildLookupMaps();

      return {
        crime: crimeData,
        rent: rentData,
        schools: schoolsData,
        parks: parksData,
        neighbourhoods: neighbourhoodsData
      };
    })
    .catch(error => {
      // Reset loading promise on error to allow retry
      loadingPromise = null;
      throw error;
    });

  return loadingPromise;
};

/**
 * Get all data sources (must call loadAllData first)
 * @returns {Object} All loaded data
 */
export const getAllData = () => {
  return {
    crime: crimeData,
    rent: rentData,
    schools: schoolsData,
    parks: parksData,
    neighbourhoods: neighbourhoodsData
  };
};

/**
 * Get crime data by neighbourhood name (O(1) lookup)
 * @param {string} neighbourhoodName
 * @returns {Object|null} Crime data for the neighbourhood
 */
export const getCrimeByNeighbourhood = (neighbourhoodName) => {
  if (!neighbourhoodName || !crimeDataMap) return null;

  const normalizedName = neighbourhoodName.toUpperCase().trim();
  return crimeDataMap.get(normalizedName) || null;
};

/**
 * Get rent data by neighbourhood name (O(1) lookup)
 * @param {string} neighbourhoodName
 * @returns {Object|null} Rent data for the neighbourhood
 */
export const getRentByNeighbourhood = (neighbourhoodName) => {
  if (!neighbourhoodName || !rentDataMap) return null;

  const normalizedName = neighbourhoodName.toUpperCase().trim();
  return rentDataMap.get(normalizedName) || null;
};

/**
 * Get schools within a neighbourhood
 * @param {string} neighbourhoodName
 * @param {Object} neighbourhoodGeometry - GeoJSON geometry to check containment
 * @returns {Array} Schools in the neighbourhood
 */
export const getSchoolsByNeighbourhood = (neighbourhoodName, neighbourhoodGeometry) => {
  if (!schoolsData) return [];
  // For now, return all schools - spatial filtering can be added later
  return schoolsData.features;
};

/**
 * Get parks within a neighbourhood
 * @param {string} neighbourhoodName
 * @returns {Array} Parks in the neighbourhood
 */
export const getParksByNeighbourhood = (neighbourhoodName) => {
  if (!neighbourhoodName || !parksData) return [];

  const normalizedName = neighbourhoodName.toUpperCase().trim();
  const parks = parksData.features.filter(
    feature => feature.properties.neighbourhood_name?.toUpperCase() === normalizedName
  );

  return parks;
};

/**
 * Get all neighbourhoods
 * @returns {Object} Neighbourhoods GeoJSON
 */
export const getNeighbourhoods = () => {
  return neighbourhoodsData;
};

/**
 * Get neighbourhood by name (O(1) lookup)
 * @param {string} neighbourhoodName
 * @returns {Object|null} Neighbourhood feature
 */
export const getNeighbourhoodByName = (neighbourhoodName) => {
  if (!neighbourhoodName || !neighbourhoodDataMap) return null;

  const normalizedName = neighbourhoodName.toUpperCase().trim();
  return neighbourhoodDataMap.get(normalizedName) || null;
};

export default {
  loadAllData,
  getAllData,
  getCrimeByNeighbourhood,
  getRentByNeighbourhood,
  getSchoolsByNeighbourhood,
  getParksByNeighbourhood,
  getNeighbourhoods,
  getNeighbourhoodByName
};
