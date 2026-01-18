const MapLegend = () => {
  return (
    <div className="absolute bottom-6 left-6 bg-white shadow-lg rounded-lg p-4 z-[1000] min-w-[250px]">
      <h3 className="font-bold text-sm mb-1 text-slate-900 uppercase tracking-wide">
        Map Legend
      </h3>
      <p className="text-xs text-slate-500 mb-3">Neighbourhood Performance</p>

      <div className="space-y-2">
        <div className="flex items-center">
          <span className="text-2xl mr-2">🔵</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800">Best</p>
            <p className="text-xs text-slate-500">Top 25%</p>
          </div>
        </div>

        <div className="flex items-center">
          <span className="text-2xl mr-2">🟢</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800">Good</p>
            <p className="text-xs text-slate-500">Above Average</p>
          </div>
        </div>

        <div className="flex items-center">
          <span className="text-2xl mr-2">🟡</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800">Fair</p>
            <p className="text-xs text-slate-500">Below Average</p>
          </div>
        </div>

        <div className="flex items-center">
          <span className="text-2xl mr-2">🔴</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800">Poor</p>
            <p className="text-xs text-slate-500">Bottom 25%</p>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-200">
        <p className="text-xs text-slate-600">
          <span className="font-semibold">Crime:</span> Lower is better
        </p>
        <p className="text-xs text-slate-600">
          <span className="font-semibold">Schools/Parks:</span> More is better
        </p>
      </div>
    </div>
  );
};

export default MapLegend;
