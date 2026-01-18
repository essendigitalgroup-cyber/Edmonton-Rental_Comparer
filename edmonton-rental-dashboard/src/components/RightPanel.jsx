import { useAppContext } from '../context/AppContext';
import {
  isDataLoaded,
  getCrimeByNeighbourhood,
  getRentByNeighbourhood,
  getParksByNeighbourhood,
  getCrimeQuartile,
  getSchoolsQuartile,
  getParksQuartile
} from '../utils/dataLoader';

const UNIT_TYPE_LABELS = {
  studio: 'Studio',
  '1_bedroom': '1 Bedroom',
  '2_bedroom': '2 Bedroom',
  '3_bedroom_plus': '3+ Bedroom'
};

const RightPanel = () => {
  const { selectedNeighbourhood, setSelectedNeighbourhood, selectedUnitTypes, visibleLayers } = useAppContext();

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

  // Get quartile data
  const crimeQuartile = getCrimeQuartile(neighbourhoodName);
  const schoolsQuartile = getSchoolsQuartile(neighbourhoodName);
  const parksQuartile = getParksQuartile(neighbourhoodName);

  return (
    <div className="absolute top-4 right-4 w-96 bg-white shadow-lg rounded-lg p-6 z-[1000]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-slate-900">{neighbourhoodName}</h2>
        <button
          onClick={() => setSelectedNeighbourhood(null)}
          className="text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded transition-colors"
          aria-label="Close panel"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Crime Stats with Quartile */}
      {visibleLayers.crime && (
        <div className="mb-4 pb-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-slate-800">Crime Statistics</h3>
            {crimeQuartile && (
              <div className="flex items-center">
                <span className="text-2xl mr-1" aria-label={`Crime: ${crimeQuartile.label} (tier ${crimeQuartile.tier} of 4)`}>
                  {crimeQuartile.emoji}
                </span>
                <span className="text-sm text-slate-600">{crimeQuartile.label}</span>
              </div>
            )}
          </div>
          {crimeData ? (
            <div className="space-y-1">
              <p className="text-sm text-slate-700">
                <span className="font-semibold">Total (2025):</span> {crimeData.violent_weapons_crimes_total_2025} incidents
              </p>
              <p className="text-sm text-slate-700">
                <span className="font-semibold">Monthly Average:</span> {crimeData.violent_weapons_crimes_monthly_avg} incidents/month
              </p>
              {crimeQuartile && (
                <p className="text-xs text-slate-500 mt-1">{crimeQuartile.description}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No crime data available</p>
          )}
        </div>
      )}

      {/* Rent Stats - Selected Unit Types Only */}
      {visibleLayers.rent && (
        <div className="mb-4 pb-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">Market Rental Rates</h3>
          {rentData ? (
            <div className="space-y-3">
              {selectedUnitTypes.map(unitType => {
                const price = rentData[unitType];
                return (
                  <div key={unitType} className="bg-blue-50 p-3 rounded-md">
                    <p className="text-sm text-slate-600 mb-1">
                      {UNIT_TYPE_LABELS[unitType]}
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {price ? `$${Math.round(price).toLocaleString()}` : 'N/A'}
                      {price && <span className="text-sm font-normal text-slate-600">/month</span>}
                    </p>
                  </div>
                );
              })}
              <p className="text-xs text-slate-500 mt-2">Source: CMHC October 2024</p>
              {rentData._inheritedFrom && (
                <div className="mt-2 p-2 bg-yellow-50 text-yellow-800 text-xs rounded border border-yellow-100">
                  <strong>Note:</strong> Data averaged for the broader <em>{rentData._inheritedFrom}</em> zone.
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No rent data available for this neighbourhood</p>
          )}
        </div>
      )}

      {/* Schools with Quartile */}
      {visibleLayers.schools && (
        <div className="mb-4 pb-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-slate-800">Schools</h3>
            {schoolsQuartile && (
              <div className="flex items-center">
                <span className="text-2xl mr-1" aria-label={`Schools: ${schoolsQuartile.label} (tier ${schoolsQuartile.tier} of 4)`}>
                  {schoolsQuartile.emoji}
                </span>
                <span className="text-sm text-slate-600">{schoolsQuartile.label}</span>
              </div>
            )}
          </div>
          {schoolsQuartile ? (
            <p className="text-xs text-slate-500">{schoolsQuartile.description}</p>
          ) : (
            <p className="text-sm text-slate-500">No schools data available</p>
          )}
        </div>
      )}

      {/* Parks with Quartile */}
      {visibleLayers.parks && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-slate-800">Parks & Playgrounds</h3>
            {parksQuartile && (
              <div className="flex items-center">
                <span className="text-2xl mr-1" aria-label={`Parks: ${parksQuartile.label} (tier ${parksQuartile.tier} of 4)`}>
                  {parksQuartile.emoji}
                </span>
                <span className="text-sm text-slate-600">{parksQuartile.label}</span>
              </div>
            )}
          </div>
          {parks && parks.length > 0 ? (
            <div>
              <p className="text-sm text-slate-700 mb-1">
                <span className="font-semibold">{parks.length}</span> playground{parks.length !== 1 ? 's' : ''} in this neighbourhood
              </p>
              {parksQuartile && (
                <p className="text-xs text-slate-500 mt-1">{parksQuartile.description}</p>
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
