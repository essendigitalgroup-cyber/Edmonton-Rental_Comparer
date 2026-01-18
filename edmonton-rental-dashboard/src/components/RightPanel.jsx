import { useAppContext } from '../context/AppContext';
import { isDataLoaded, getCrimeByNeighbourhood, getRentByNeighbourhood, getParksByNeighbourhood } from '../utils/dataLoader';

const RightPanel = () => {
  const { selectedNeighbourhood, setSelectedNeighbourhood, activeUnitType, visibleLayers } = useAppContext();

  if (!selectedNeighbourhood) {
    return (
      <div className="absolute top-4 right-4 w-96 bg-white shadow-lg rounded-lg p-6 z-[1000]">
        <p className="text-slate-500 text-center">
          Click on a neighbourhood to see details
        </p>
      </div>
    );
  }

  // Check if data is still loading (edge case: user clicks before data loads)
  if (!isDataLoaded()) {
    return (
      <div className="absolute top-4 right-4 w-96 bg-white shadow-lg rounded-lg p-6 z-[1000]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-slate-500">Loading neighbourhood data...</p>
        </div>
      </div>
    );
  }

  const neighbourhoodName = selectedNeighbourhood.properties.name;
  const crimeData = getCrimeByNeighbourhood(neighbourhoodName);
  const rentData = getRentByNeighbourhood(neighbourhoodName);
  const parks = getParksByNeighbourhood(neighbourhoodName);

  const getRentValue = () => {
    if (!rentData) return null;
    return rentData[activeUnitType];
  };

  const rentValue = getRentValue();

  return (
    <div className="absolute top-4 right-4 w-96 bg-white shadow-lg rounded-lg p-6 z-[1000] max-h-[calc(100vh-2rem)] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-slate-900">{neighbourhoodName}</h2>
        <button
          onClick={() => setSelectedNeighbourhood(null)}
          className="text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Close panel"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Crime Stats */}
      {visibleLayers.crime && (
        <div className="mb-4 pb-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Crime Statistics</h3>
          {crimeData ? (
            <div className="space-y-1">
              <p className="text-sm text-slate-700">
                <span className="font-semibold">Total (2025):</span> {crimeData.violent_weapons_crimes_total_2025} incidents
              </p>
              <p className="text-sm text-slate-700">
                <span className="font-semibold">Monthly Average:</span> {crimeData.violent_weapons_crimes_monthly_avg} incidents/month
              </p>
              <p className="text-xs text-slate-500 mt-1">Violent & weapons crimes only</p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No crime data available</p>
          )}
        </div>
      )}

      {/* Rent Stats */}
      {visibleLayers.rent && (
        <div className="mb-4 pb-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Rental Prices</h3>
          {rentData ? (
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-slate-600 mb-1">
                  {activeUnitType === 'studio' && 'Studio'}
                  {activeUnitType === '1_bedroom' && '1 Bedroom'}
                  {activeUnitType === '2_bedroom' && '2 Bedroom'}
                  {activeUnitType === '3_bedroom_plus' && '3+ Bedroom'}
                  {activeUnitType === 'total_avg' && 'Total Average'}
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {rentValue ? `$${rentValue}` : 'N/A'}
                  {rentValue && <span className="text-sm font-normal text-slate-600">/month</span>}
                </p>
              </div>
              <details className="text-sm">
                <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                  View all unit types
                </summary>
                <div className="mt-2 space-y-1 pl-2">
                  <p className="text-slate-700">Studio: {rentData.studio ? `$${rentData.studio}` : 'N/A'}</p>
                  <p className="text-slate-700">1 Bedroom: {rentData['1_bedroom'] ? `$${rentData['1_bedroom']}` : 'N/A'}</p>
                  <p className="text-slate-700">2 Bedroom: {rentData['2_bedroom'] ? `$${rentData['2_bedroom']}` : 'N/A'}</p>
                  <p className="text-slate-700">3+ Bedroom: {rentData['3_bedroom_plus'] ? `$${rentData['3_bedroom_plus']}` : 'N/A'}</p>
                  <p className="text-slate-700 font-semibold mt-1">Total Average: {rentData.total_avg ? `$${rentData.total_avg}` : 'N/A'}</p>
                </div>
              </details>
              <p className="text-xs text-slate-500 mt-2">Source: CMHC October 2024</p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No rent data available for this neighbourhood</p>
          )}
        </div>
      )}

      {/* Parks */}
      {visibleLayers.parks && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Parks & Playgrounds</h3>
          {parks && parks.length > 0 ? (
            <div>
              <p className="text-sm text-slate-700 mb-2">
                <span className="font-semibold">{parks.length}</span> playground{parks.length !== 1 ? 's' : ''} in this neighbourhood
              </p>
              {parks.length <= 5 && (
                <ul className="text-sm text-slate-600 space-y-1">
                  {parks.map((park, idx) => (
                    <li key={idx} className="truncate">
                      • {park.properties.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No playgrounds data for this neighbourhood</p>
          )}
        </div>
      )}
    </div>
  );
};

export default RightPanel;
