import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useAppContext } from '../context/AppContext';
import { getNeighbourhoods, getRentByNeighbourhood } from '../utils/dataLoader';
import schoolsData from '../data/schools.geojson';
import parksData from '../data/parks.geojson';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const Map = () => {
  const { selectedNeighbourhood, setSelectedNeighbourhood, activeUnitType, visibleLayers } = useAppContext();
  const [neighbourhoods, setNeighbourhoods] = useState(null);

  useEffect(() => {
    const data = getNeighbourhoods();
    setNeighbourhoods(data);
  }, []);

  // Get color based on rent value
  const getRentColor = (rentValue) => {
    if (!rentValue || rentValue === null) return '#d1d5db'; // gray for no data

    // Color scale from green (cheap) to red (expensive)
    if (rentValue < 1200) return '#10b981'; // green
    if (rentValue < 1350) return '#84cc16'; // lime
    if (rentValue < 1500) return '#eab308'; // yellow
    if (rentValue < 1650) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  // Style for neighbourhood polygons
  const getNeighbourhoodStyle = (feature) => {
    const neighbourhoodName = feature.properties.name;
    const rentData = getRentByNeighbourhood(neighbourhoodName);
    const rentValue = rentData ? rentData[activeUnitType] : null;

    const isSelected = selectedNeighbourhood?.properties.name === neighbourhoodName;

    return {
      fillColor: visibleLayers.rent ? getRentColor(rentValue) : '#e2e8f0',
      weight: isSelected ? 3 : 1,
      opacity: 1,
      color: isSelected ? '#1e40af' : '#64748b',
      fillOpacity: 0.6
    };
  };

  // Handle neighbourhood click
  const onEachNeighbourhood = (feature, layer) => {
    layer.on({
      click: () => {
        setSelectedNeighbourhood(feature);
      },
      mouseover: (e) => {
        const layer = e.target;
        if (selectedNeighbourhood?.properties.name !== feature.properties.name) {
          layer.setStyle({
            weight: 2,
            fillOpacity: 0.8
          });
        }
      },
      mouseout: (e) => {
        const layer = e.target;
        if (selectedNeighbourhood?.properties.name !== feature.properties.name) {
          layer.setStyle({
            weight: 1,
            fillOpacity: 0.6
          });
        }
      }
    });

    // Tooltip
    layer.bindTooltip(feature.properties.name, {
      permanent: false,
      direction: 'center',
      className: 'neighbourhood-tooltip'
    });
  };

  // School icon
  const schoolIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3b82f6" width="24" height="24">
        <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
        <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
      </svg>
    `),
    iconSize: [24, 24],
    iconAnchor: [12, 24]
  });

  // Park icon
  const parkIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#10b981" width="20" height="20">
        <circle cx="12" cy="12" r="10" />
      </svg>
    `),
    iconSize: [20, 20],
    iconAnchor: [10, 20]
  });

  if (!neighbourhoods) {
    return <div className="flex items-center justify-center h-full">Loading map...</div>;
  }

  // Edmonton center coordinates
  const edmontonCenter = [53.5461, -113.4938];

  return (
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
          key={activeUnitType} // Re-render when unit type changes
        />
      )}

      {/* Schools */}
      {visibleLayers.schools && schoolsData.features.map((school, idx) => (
        <Marker
          key={`school-${idx}`}
          position={[school.geometry.coordinates[1], school.geometry.coordinates[0]]}
          icon={schoolIcon}
        >
          <Popup>
            <div>
              <h3 className="font-bold">{school.properties.school_name}</h3>
              <p className="text-sm">{school.properties.school_type}</p>
              <p className="text-sm">{school.properties.grades}</p>
              <p className="text-xs text-slate-500 mt-1">{school.properties.address}</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Parks */}
      {visibleLayers.parks && parksData.features.slice(0, 200).map((park, idx) => (
        <Marker
          key={`park-${idx}`}
          position={[park.geometry.coordinates[1], park.geometry.coordinates[0]]}
          icon={parkIcon}
        >
          <Popup>
            <div>
              <h3 className="font-bold">{park.properties.name}</h3>
              <p className="text-sm">{park.properties.type}</p>
              <p className="text-xs text-slate-500">{park.properties.neighbourhood_name}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;
