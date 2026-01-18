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

  // Calculate tooltip position with viewport overflow detection
  const TOOLTIP_OFFSET = 15;
  const TOOLTIP_WIDTH = 200; // min-w-[200px]
  const TOOLTIP_HEIGHT = 200; // estimated max height

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Check if tooltip would overflow right edge
  const wouldOverflowRight = mousePosition.x + TOOLTIP_OFFSET + TOOLTIP_WIDTH > viewportWidth;
  const left = wouldOverflowRight
    ? mousePosition.x - TOOLTIP_WIDTH - TOOLTIP_OFFSET
    : mousePosition.x + TOOLTIP_OFFSET;

  // Check if tooltip would overflow bottom edge
  const wouldOverflowBottom = mousePosition.y + TOOLTIP_OFFSET + TOOLTIP_HEIGHT > viewportHeight;
  const top = wouldOverflowBottom
    ? mousePosition.y - TOOLTIP_HEIGHT - TOOLTIP_OFFSET
    : mousePosition.y + TOOLTIP_OFFSET;

  return (
    <div
      className="fixed pointer-events-none z-[2000] bg-slate-900 text-white rounded-lg shadow-2xl p-3 min-w-[200px]"
      style={{
        left: `${left}px`,
        top: `${top}px`,
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
                <span className="text-slate-300">{UNIT_TYPE_LABELS[unitType]}:</span>{' '}
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
            <span className="mr-2" aria-label={`Crime: ${crimeQuartile.label} (tier ${crimeQuartile.tier} of 4)`}>
              {crimeQuartile.emoji}
            </span>
            <span className="text-slate-300">{crimeQuartile.label}</span>
          </div>
        )}
        {schoolsQuartile && (
          <div className="flex items-center text-xs">
            <span className="mr-2" aria-label={`Schools: ${schoolsQuartile.label} (tier ${schoolsQuartile.tier} of 4)`}>
              {schoolsQuartile.emoji}
            </span>
            <span className="text-slate-300">{schoolsQuartile.label} Schools</span>
          </div>
        )}
        {parksQuartile && (
          <div className="flex items-center text-xs">
            <span className="mr-2" aria-label={`Parks: ${parksQuartile.label} (tier ${parksQuartile.tier} of 4)`}>
              {parksQuartile.emoji}
            </span>
            <span className="text-slate-300">{parksQuartile.label} Parks</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default HoverTooltip;
