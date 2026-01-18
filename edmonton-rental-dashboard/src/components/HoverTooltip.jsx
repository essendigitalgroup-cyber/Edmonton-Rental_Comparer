import { useAppContext } from '../context/AppContext';
import { getRentByNeighbourhood, getCrimeQuartile, getSchoolsQuartile, getParksQuartile } from '../utils/dataLoader';

const UNIT_TYPE_LABELS = {
  studio: 'Studio',
  '1_bedroom': '1 Bedroom',
  '2_bedroom': '2 Bedroom',
  '3_bedroom_plus': '3+ Bedroom'
};

const HoverTooltip = ({ neighbourhood, mousePosition }) => {
  const { selectedUnitTypes } = useAppContext();

  if (!neighbourhood || !mousePosition) return null;

  const neighbourhoodName = neighbourhood.properties.name;

  // Get rent data
  const rentData = getRentByNeighbourhood(neighbourhoodName);

  // Get quartile data
  const crimeQuartile = getCrimeQuartile(neighbourhoodName);
  const schoolsQuartile = getSchoolsQuartile(neighbourhoodName);
  const parksQuartile = getParksQuartile(neighbourhoodName);

  return (
    <div
      className="fixed pointer-events-none z-[2000] bg-slate-900 text-white rounded-lg shadow-2xl p-3 min-w-[200px]"
      style={{
        left: `${mousePosition.x + 15}px`,
        top: `${mousePosition.y + 15}px`,
        transform: 'translate(0, 0)'
      }}
    >
      {/* Neighbourhood Name */}
      <h4 className="font-bold text-sm mb-2 text-white uppercase tracking-wide">
        {neighbourhoodName}
      </h4>

      {/* Rent Prices for Selected Unit Types */}
      {rentData && selectedUnitTypes.length > 0 && (
        <div className="mb-2 pb-2 border-b border-slate-700">
          {selectedUnitTypes.map(unitType => {
            const price = rentData[unitType];
            return (
              <div key={unitType} className="text-xs mb-1">
                <span className="text-slate-400">{UNIT_TYPE_LABELS[unitType]}:</span>{' '}
                <span className="font-semibold text-white">
                  {price ? `~$${Math.round(price).toLocaleString()}` : 'N/A'}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Quartile Indicators */}
      <div className="space-y-1">
        {crimeQuartile && (
          <div className="flex items-center text-xs">
            <span className="mr-2">{crimeQuartile.emoji}</span>
            <span className="text-slate-300">{crimeQuartile.label}</span>
          </div>
        )}
        {schoolsQuartile && (
          <div className="flex items-center text-xs">
            <span className="mr-2">{schoolsQuartile.emoji}</span>
            <span className="text-slate-300">{schoolsQuartile.label} Schools</span>
          </div>
        )}
        {parksQuartile && (
          <div className="flex items-center text-xs">
            <span className="mr-2">{parksQuartile.emoji}</span>
            <span className="text-slate-300">{parksQuartile.label} Parks</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default HoverTooltip;
