import { useAppContext } from '../context/AppContext';
import { getCrimeByNeighbourhood, getRentByNeighbourhood, getParksByNeighbourhood } from '../utils/dataLoader';

const RightPanel = () => {
  const { selectedNeighbourhood, activeUnitType, visibleLayers } = useAppContext();

  if (!selectedNeighbourhood) {
    return (
      <div className="absolute top-4 right-4 w-96 bg-white shadow-lg rounded-lg p-6 z-[1000]">
        <p className="text-slate-500 text-center">
          Click or hover over a neighbourhood to see details
        </p>
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
      <h2 className="text-2xl font-bold text-slate-900 mb-4">{neighbourhoodName}</h2>

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
