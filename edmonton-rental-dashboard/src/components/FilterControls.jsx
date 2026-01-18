import { useAppContext } from '../context/AppContext';

const FilterControls = () => {
  const { activeUnitType, setActiveUnitType, visibleLayers, toggleLayer } = useAppContext();

  const unitTypes = [
    { value: 'studio', label: 'Studio' },
    { value: '1_bedroom', label: '1 Bedroom' },
    { value: '2_bedroom', label: '2 Bedroom' },
    { value: '3_bedroom_plus', label: '3+ Bedroom' },
    { value: 'total_avg', label: 'Total Average' }
  ];

  return (
    <div className="absolute top-4 left-4 bg-white shadow-lg rounded-lg p-4 z-[1000] max-w-xs">
      <h3 className="font-bold text-lg mb-3 text-slate-900">Filters</h3>

      {/* Unit Type Selector */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Rent by Unit Type:
        </label>
        <select
          value={activeUnitType}
          onChange={(e) => setActiveUnitType(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          {unitTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-500 mt-1">
          Map colors update instantly
        </p>
      </div>

      {/* Data Layer Toggles */}
      <div className="border-t border-slate-200 pt-3">
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Data Layers:
        </label>
        <div className="space-y-2">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={visibleLayers.crime}
              onChange={() => toggleLayer('crime')}
              className="mr-2 w-4 h-4"
            />
            <span className="text-sm text-slate-700">Crime Data</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={visibleLayers.rent}
              onChange={() => toggleLayer('rent')}
              className="mr-2 w-4 h-4"
            />
            <span className="text-sm text-slate-700">Rent Data</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={visibleLayers.schools}
              onChange={() => toggleLayer('schools')}
              className="mr-2 w-4 h-4"
            />
            <span className="text-sm text-slate-700">Schools</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={visibleLayers.parks}
              onChange={() => toggleLayer('parks')}
              className="mr-2 w-4 h-4"
            />
            <span className="text-sm text-slate-700">Parks</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;
