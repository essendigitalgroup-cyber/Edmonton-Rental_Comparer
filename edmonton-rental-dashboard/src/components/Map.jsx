import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { useAppContext } from '../context/AppContext';
import { loadAllData } from '../utils/dataLoader';
import HoverTooltip from './HoverTooltip';

const Map = () => {
  const { selectedNeighbourhood, setSelectedNeighbourhood } = useAppContext();
  const [neighbourhoods, setNeighbourhoods] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredNeighbourhood, setHoveredNeighbourhood] = useState(null);
  const [mousePosition, setMousePosition] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadAllData();
        setNeighbourhoods(data.neighbourhoods);
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setError(error.message || 'Failed to load map data');
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Style for neighbourhood polygons (memoized to prevent unnecessary re-computation)
  const getNeighbourhoodStyle = useCallback((feature) => {
    const isSelected = selectedNeighbourhood?.properties.name === feature.properties.name;

    return {
      fillColor: '#e2e8f0', // Neutral slate color
      weight: isSelected ? 3 : 1,
      opacity: 1,
      color: isSelected ? '#1e40af' : '#64748b',
      fillOpacity: isSelected ? 0.7 : 0.5
    };
  }, [selectedNeighbourhood]);

  // Handle neighbourhood interactions
  const onEachNeighbourhood = (feature, layer) => {
    layer.on({
      click: () => {
        setSelectedNeighbourhood(feature);
      },
      mouseover: (e) => {
        const layer = e.target;
        setHoveredNeighbourhood(feature);
        if (selectedNeighbourhood?.properties.name !== feature.properties.name) {
          layer.setStyle({
            weight: 2,
            fillOpacity: 0.8
          });
        }
      },
      mouseout: (e) => {
        const layer = e.target;
        setHoveredNeighbourhood(null);
        if (selectedNeighbourhood?.properties.name !== feature.properties.name) {
          layer.setStyle({
            weight: 1,
            fillOpacity: 0.6
          });
        }
      },
      mousemove: (e) => {
        setMousePosition({
          x: e.originalEvent.clientX,
          y: e.originalEvent.clientY
        });
      }
    });
  };

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-100">
        <div className="text-center max-w-md px-6">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Failed to Load Map Data</h2>
          <p className="text-slate-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading || !neighbourhoods) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Loading Edmonton neighbourhoods...</p>
        </div>
      </div>
    );
  }

  // Edmonton center coordinates
  const edmontonCenter = [53.5461, -113.4938];

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={edmontonCenter}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Neighbourhood boundaries */}
        {neighbourhoods && (
          <GeoJSON
            data={neighbourhoods}
            style={getNeighbourhoodStyle}
            onEachFeature={onEachNeighbourhood}
          />
        )}
      </MapContainer>

      {/* Custom dark-themed hover tooltip */}
      <HoverTooltip
        neighbourhood={hoveredNeighbourhood}
        mousePosition={mousePosition}
      />
    </div>
  );
};

export default Map;
