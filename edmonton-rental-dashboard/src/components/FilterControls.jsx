import { useAppContext } from '../context/AppContext';

// Unit types constant (moved outside to prevent recreation on every render)
const UNIT_TYPES = [
  { value: 'studio', label: 'Studio' },
  { value: '1_bedroom', label: '1 Bedroom' },
  { value: '2_bedroom', label: '2 Bedroom' },
  { value: '3_bedroom_plus', label: '3+ Bedroom' }
];

const FilterControls = () => {
  const { selectedUnitTypes, toggleUnitType, visibleLayers, toggleLayer } = useAppContext();

  return (
    <div className="absolute top-4 left-4 bg-white shadow-lg rounded-lg p-4 z-[1000] max-w-xs">
      <h3 className="font-bold text-lg mb-3 text-slate-900">Filters</h3>

      {/* Unit Type Selector (Multiple Selection) */}
      <div className="mb-4">
        <p className="block text-sm font-semibold text-slate-700 mb-2">
          Unit Type:
        </p>
        <div className="space-y-2">
          {UNIT_TYPES.map(type => (
            <label key={type.value} htmlFor={`unit-${type.value}`} className="flex items-center cursor-pointer">
              <input
                id={`unit-${type.value}`}
                type="checkbox"
                checked={selectedUnitTypes.includes(type.value)}
                onChange={() => toggleUnitType(type.value)}
                aria-label={`Toggle ${type.label}`}
                className="mr-2 w-4 h-4 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
              />
              <span className="text-sm text-slate-700">{type.label}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Select one or more unit types
        </p>
      </div>

      {/* Data Layer Toggles */}
      <div className="border-t border-slate-200 pt-3">
        <p className="block text-sm font-semibold text-slate-700 mb-2">
          Data Layers:
        </p>
        <div className="space-y-2">
          <label htmlFor="crime-toggle" className="flex items-center cursor-pointer">
            <input
              id="crime-toggle"
              type="checkbox"
              checked={visibleLayers.crime}
              onChange={() => toggleLayer('crime')}
              aria-label="Toggle crime data layer"
              className="mr-2 w-4 h-4 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
            />
            <span className="text-sm text-slate-700">Crime Data</span>
          </label>
          <label htmlFor="rent-toggle" className="flex items-center cursor-pointer">
            <input
              id="rent-toggle"
              type="checkbox"
              checked={visibleLayers.rent}
              onChange={() => toggleLayer('rent')}
              aria-label="Toggle rent data layer"
              className="mr-2 w-4 h-4 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
            />
            <span className="text-sm text-slate-700">Rent Data</span>
          </label>
          <label htmlFor="schools-toggle" className="flex items-center cursor-pointer">
            <input
              id="schools-toggle"
              type="checkbox"
              checked={visibleLayers.schools}
              onChange={() => toggleLayer('schools')}
              aria-label="Toggle schools layer"
              className="mr-2 w-4 h-4 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
            />
            <span className="text-sm text-slate-700">Schools</span>
          </label>
          <label htmlFor="parks-toggle" className="flex items-center cursor-pointer">
            <input
              id="parks-toggle"
              type="checkbox"
              checked={visibleLayers.parks}
              onChange={() => toggleLayer('parks')}
              aria-label="Toggle parks layer"
              className="mr-2 w-4 h-4 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
            />
            <span className="text-sm text-slate-700">Parks</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;
