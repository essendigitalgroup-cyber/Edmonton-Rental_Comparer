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

/**
 * Load all data files asynchronously
 * @returns {Promise<Object>} All loaded data
 */
export const loadAllData = async () => {
  if (!crimeData) {
    const [crime, rent, schools, parks, neighbourhoods] = await Promise.all([
      fetch(crimeDataUrl).then(r => r.json()),
      fetch(rentDataUrl).then(r => r.json()),
      fetch(schoolsDataUrl).then(r => r.json()),
      fetch(parksDataUrl).then(r => r.json()),
      fetch(neighbourhoodsDataUrl).then(r => r.json())
    ]);

    crimeData = crime;
    rentData = rent;
    schoolsData = schools;
    parksData = parks;
    neighbourhoodsData = neighbourhoods;
  }

  return {
    crime: crimeData,
    rent: rentData,
    schools: schoolsData,
    parks: parksData,
    neighbourhoods: neighbourhoodsData
  };
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
 * Get crime data by neighbourhood name
 * @param {string} neighbourhoodName
 * @returns {Object|null} Crime data for the neighbourhood
 */
export const getCrimeByNeighbourhood = (neighbourhoodName) => {
  if (!neighbourhoodName || !crimeData) return null;

  const normalizedName = neighbourhoodName.toUpperCase().trim();
  const crimeEntry = crimeData.crime_by_neighbourhood.find(
    entry => entry.neighbourhood_name.toUpperCase() === normalizedName
  );

  return crimeEntry || null;
};

/**
 * Get rent data by neighbourhood name
 * @param {string} neighbourhoodName
 * @returns {Object|null} Rent data for the neighbourhood
 */
export const getRentByNeighbourhood = (neighbourhoodName) => {
  if (!neighbourhoodName || !rentData) return null;

  const normalizedName = neighbourhoodName.toUpperCase().trim();
  const rentEntry = rentData.rent_by_neighbourhood.find(
    entry => entry.neighbourhood_name.toUpperCase() === normalizedName
  );

  return rentEntry || null;
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
 * Get neighbourhood by name
 * @param {string} neighbourhoodName
 * @returns {Object|null} Neighbourhood feature
 */
export const getNeighbourhoodByName = (neighbourhoodName) => {
  if (!neighbourhoodName || !neighbourhoodsData) return null;

  const normalizedName = neighbourhoodName.toUpperCase().trim();
  const neighbourhood = neighbourhoodsData.features.find(
    feature => feature.properties.name.toUpperCase() === normalizedName
  );

  return neighbourhood || null;
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
