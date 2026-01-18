/**
 * Quartile Calculator Utility
 *
 * Calculates quartile rankings for crime, schools, and parks data.
 * Assigns each neighbourhood a quartile tier (1-4) with descriptive labels.
 */

/**
 * Calculate quartile thresholds for a dataset
 * @param {number[]} values - Array of numeric values
 * @returns {{q1: number, q2: number, q3: number}} Quartile thresholds
 */
const calculateQuartiles = (values) => {
  // Guard clause for empty arrays
  if (!values || values.length === 0) {
    return { q1: 0, q2: 0, q3: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;

  const q1Index = Math.floor(n * 0.25);
  const q2Index = Math.floor(n * 0.50);
  const q3Index = Math.floor(n * 0.75);

  return {
    q1: sorted[q1Index],
    q2: sorted[q2Index],
    q3: sorted[q3Index]
  };
};

/**
 * Get quartile tier for a value (1 = best, 4 = worst)
 * @param {number} value - Value to check
 * @param {{q1: number, q2: number, q3: number}} quartiles - Quartile thresholds
 * @param {boolean} lowerIsBetter - True if lower values are better (e.g., crime)
 * @returns {number} Quartile tier (1-4)
 */
const getQuartileTier = (value, quartiles, lowerIsBetter = true) => {
  if (lowerIsBetter) {
    // For crime: lower is better
    if (value <= quartiles.q1) return 1; // Top quartile (🔵)
    if (value <= quartiles.q2) return 2; // Second quartile (🟢)
    if (value <= quartiles.q3) return 3; // Third quartile (🟡)
    return 4; // Bottom quartile (🔴)
  } else {
    // For schools/parks: higher is better
    if (value >= quartiles.q3) return 1; // Top quartile (🔵)
    if (value >= quartiles.q2) return 2; // Second quartile (🟢)
    if (value >= quartiles.q1) return 3; // Third quartile (🟡)
    return 4; // Bottom quartile (🔴)
  }
};

/**
 * Get descriptor text for quartile tier
 * @param {number} tier - Quartile tier (1-4)
 * @param {string} metric - Metric name ('crime', 'schools', 'parks')
 * @returns {{emoji: string, label: string, description: string}}
 */
const getQuartileDescriptor = (tier, metric) => {
  const descriptors = {
    crime: {
      1: { emoji: '🔵', label: 'Very Safe', description: 'Top 25% safest neighbourhoods' },
      2: { emoji: '🟢', label: 'Safe', description: 'Above average safety' },
      3: { emoji: '🟡', label: 'Moderate', description: 'Average safety levels' },
      4: { emoji: '🔴', label: 'Higher Crime', description: 'Bottom 25% for safety' }
    },
    schools: {
      1: { emoji: '🔵', label: 'Excellent Schools', description: 'Top 25% for school access' },
      2: { emoji: '🟢', label: 'Good Schools', description: 'Above average school access' },
      3: { emoji: '🟡', label: 'Moderate Schools', description: 'Average school access' },
      4: { emoji: '🔴', label: 'Limited Schools', description: 'Bottom 25% for school access' }
    },
    parks: {
      1: { emoji: '🔵', label: 'Excellent Parks', description: 'Top 25% for park access' },
      2: { emoji: '🟢', label: 'Good Parks', description: 'Above average park access' },
      3: { emoji: '🟡', label: 'Moderate Parks', description: 'Average park access' },
      4: { emoji: '🔴', label: 'Limited Parks', description: 'Bottom 25% for park access' }
    }
  };

  return descriptors[metric][tier];
};

/**
 * Calculate crime quartiles for all neighbourhoods
 * @param {Object} crimeData - Crime data from dataLoader
 * @returns {Map<string, {tier: number, emoji: string, label: string, description: string, value: number}>}
 */
export const calculateCrimeQuartiles = (crimeData) => {
  if (!crimeData?.crime_by_neighbourhood) {
    console.warn('Crime data not available for quartile calculation');
    return new Map();
  }

  // Extract crime values
  const crimeValues = crimeData.crime_by_neighbourhood.map(
    entry => entry.violent_weapons_crimes_total_2025
  );

  // Calculate quartiles
  const quartiles = calculateQuartiles(crimeValues);

  // Assign quartile tiers to each neighbourhood
  const quartileMap = new Map();
  crimeData.crime_by_neighbourhood.forEach(entry => {
    const value = entry.violent_weapons_crimes_total_2025;
    const tier = getQuartileTier(value, quartiles, true); // Lower crime is better
    const descriptor = getQuartileDescriptor(tier, 'crime');

    quartileMap.set(entry.neighbourhood_name.toUpperCase().trim(), {
      tier,
      ...descriptor,
      value
    });
  });

  console.log(`Crime quartiles calculated for ${quartileMap.size} neighbourhoods`);
  return quartileMap;
};

/**
 * Calculate schools quartiles for all neighbourhoods
 * @param {Object} schoolsData - Schools GeoJSON data
 * @param {Object} neighbourhoodsData - Neighbourhoods GeoJSON data
 * @returns {Map<string, {tier: number, emoji: string, label: string, description: string, value: number}>}
 */
export const calculateSchoolsQuartiles = (schoolsData, neighbourhoodsData) => {
  if (!schoolsData?.features || !neighbourhoodsData?.features) {
    console.warn('Schools or neighbourhoods data not available for quartile calculation');
    return new Map();
  }

  // Count schools per neighbourhood (simple approach: by neighbourhood_name property)
  const schoolCounts = new Map();

  neighbourhoodsData.features.forEach(neighbourhood => {
    const neighbourhoodName = neighbourhood.properties.name.toUpperCase().trim();
    const count = schoolsData.features.filter(
      school => school.properties.neighbourhood_name?.toUpperCase().trim() === neighbourhoodName
    ).length;
    schoolCounts.set(neighbourhoodName, count);
  });

  // Calculate quartiles
  const counts = Array.from(schoolCounts.values());
  const quartiles = calculateQuartiles(counts);

  // Assign quartile tiers
  const quartileMap = new Map();
  schoolCounts.forEach((count, neighbourhoodName) => {
    const tier = getQuartileTier(count, quartiles, false); // Higher count is better
    const descriptor = getQuartileDescriptor(tier, 'schools');

    quartileMap.set(neighbourhoodName, {
      tier,
      ...descriptor,
      value: count
    });
  });

  console.log(`Schools quartiles calculated for ${quartileMap.size} neighbourhoods`);
  return quartileMap;
};

/**
 * Calculate parks quartiles for all neighbourhoods
 * @param {Object} parksData - Parks GeoJSON data
 * @param {Object} neighbourhoodsData - Neighbourhoods GeoJSON data
 * @returns {Map<string, {tier: number, emoji: string, label: string, description: string, value: number}>}
 */
export const calculateParksQuartiles = (parksData, neighbourhoodsData) => {
  if (!parksData?.features || !neighbourhoodsData?.features) {
    console.warn('Parks or neighbourhoods data not available for quartile calculation');
    return new Map();
  }

  // Count parks per neighbourhood (by neighbourhood_name property)
  const parkCounts = new Map();

  neighbourhoodsData.features.forEach(neighbourhood => {
    const neighbourhoodName = neighbourhood.properties.name.toUpperCase().trim();
    const count = parksData.features.filter(
      park => park.properties.neighbourhood_name?.toUpperCase().trim() === neighbourhoodName
    ).length;
    parkCounts.set(neighbourhoodName, count);
  });

  // Calculate quartiles
  const counts = Array.from(parkCounts.values());
  const quartiles = calculateQuartiles(counts);

  // Assign quartile tiers
  const quartileMap = new Map();
  parkCounts.forEach((count, neighbourhoodName) => {
    const tier = getQuartileTier(count, quartiles, false); // Higher count is better
    const descriptor = getQuartileDescriptor(tier, 'parks');

    quartileMap.set(neighbourhoodName, {
      tier,
      ...descriptor,
      value: count
    });
  });

  console.log(`Parks quartiles calculated for ${quartileMap.size} neighbourhoods`);
  return quartileMap;
};

/**
 * Get quartile info for a specific neighbourhood
 * @param {string} neighbourhoodName
 * @param {Map} quartileMap
 * @returns {{tier: number, emoji: string, label: string, description: string, value: number} | null}
 */
export const getNeighbourhoodQuartile = (neighbourhoodName, quartileMap) => {
  if (!neighbourhoodName || !quartileMap) return null;
  return quartileMap.get(neighbourhoodName.toUpperCase()) || null;
};

export default {
  calculateCrimeQuartiles,
  calculateSchoolsQuartiles,
  calculateParksQuartiles,
  getNeighbourhoodQuartile
};
