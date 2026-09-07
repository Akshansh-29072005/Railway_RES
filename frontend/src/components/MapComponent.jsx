import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const stations = [
  { name: "Raipur Jn", lat: 21.25646, lng: 81.62933, color: "#ef4444" },
  { name: "Bhatapara", lat: 21.73246, lng: 81.94606, color: "#ef4444" },
  { name: "Tilda-Neora", lat: 21.55073, lng: 81.79459, color: "#ef4444" },
  { name: "Durg", lat: 21.19678, lng: 81.28458, color: "#ef4444" },
  { name: "Mandir Hasaud", lat: 21.22619, lng: 81.77281, color: "#10b981" },
  { name: "Lakholi", lat: 21.20183, lng: 81.89065, color: "#10b981" },
  { name: "Kendri", lat: 21.11000, lng: 81.54900, color: "#f97316" },
  { name: "Abhanpur", lat: 21.01500, lng: 81.60300, color: "#f97316" },
  { name: "Dhamtari", lat: 20.71200, lng: 81.54500, color: "#f97316" },
  { name: "Rajim", lat: 20.99100, lng: 81.74300, color: "#f97316" },
  { name: "Dalli Rajhara", lat: 20.90800, lng: 81.16400, color: "#3b82f6" },
  { name: "Taroki", lat: 20.28700, lng: 80.88300, color: "#3b82f6" },
  { name: "Bilaspur", lat: 22.079, lng: 82.139, color: "#ef4444" },
];

const getFeatureStyle = (feature) => {
  let color = '#ffffff';
  let weight = 4;
  let opacity = 0.8;
  let dashArray = '5, 10';

  if (feature.geometry && feature.geometry.coordinates) {
    const coords = feature.geometry.type === 'LineString' 
      ? feature.geometry.coordinates[0] 
      : feature.geometry.type === 'MultiLineString' 
        ? feature.geometry.coordinates[0][0] 
        : null;
        
    if (coords && Array.isArray(coords)) {
      const lng = coords[0];
      const lat = coords[1];
      
      // Corridor 3 (Green) - Raipur to Lakholi
      if (lat >= 21.18 && lat <= 21.26 && lng >= 81.62 && lng <= 81.90) {
        color = '#10b981'; weight = 5; opacity = 1; dashArray = null;
      }
      // Corridor 4 (Orange) - Kendri to Dhamtari / Rajim
      else if (lat >= 20.70 && lat <= 21.12 && lng >= 81.50 && lng <= 81.75) {
        color = '#f97316'; weight = 5; opacity = 1; dashArray = null;
      }
      // Corridor 2 (Blue) - Durg to Taroki
      else if (lat >= 20.25 && lat <= 21.19 && lng >= 80.80 && lng <= 81.35) {
        color = '#3b82f6'; weight = 5; opacity = 1; dashArray = null;
      }
      // Corridor 1 (Red) - Bilaspur to Durg
      else if (lat >= 21.19 && lat <= 22.20 && lng >= 81.20 && lng <= 82.20) {
        color = '#ef4444'; weight = 5; opacity = 1; dashArray = null;
      }
    }
  }

  return { color, weight, opacity, dashArray };
};

const MapComponent = () => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [21.25, 81.63],
        zoom: 9,
        scrollWheelZoom: true,
        preferCanvas: true
      });

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri',
        maxZoom: 19
      }).addTo(map);

      // Add Station Circle Markers with Tooltips
      stations.forEach(station => {
        const marker = L.circleMarker([station.lat, station.lng], {
          radius: 6,
          color: '#ffffff',
          fillColor: station.color,
          fillOpacity: 1,
          weight: 2
        }).addTo(map);

        marker.bindTooltip(`<span style="font-weight:bold; font-size:12px; color:#0f172a; padding: 2px 4px;">${station.name}</span>`, {
          permanent: true,
          direction: 'right',
          offset: [10, 0],
          opacity: 1
        });
      });

      // Fetch GeoJSON data
      fetch('/data.geojson')
        .then(response => response.json())
        .then(data => {
          if (data) {
            L.geoJSON(data, {
              style: getFeatureStyle
            }).addTo(map);

            map.fitBounds([
              [20.2, 80.8],
              [22.2, 82.2]
            ]);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('GeoJSON loading error:', err);
          setLoading(false);
        });

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="map-wrapper" style={{ position: 'relative', width: '100%', height: '100%', minHeight: '550px' }}>
      {loading && (
        <div className="loading-overlay" style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.8)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          color: '#ffffff', zIndex: 2000
        }}>
          <div className="spinner" style={{
            width: '40px', height: '40px',
            border: '4px solid rgba(255,255,255,0.2)',
            borderTopColor: '#3b82f6', borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '16px', fontWeight: 'bold' }}>Loading Track Data...</p>
        </div>
      )}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', minHeight: '550px', borderRadius: '8px' }} />
    </div>
  );
};

export default MapComponent;
