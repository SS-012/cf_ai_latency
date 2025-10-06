'use client';

import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LatencyData {
  colo: string;
  timestamp: string;
  avg_rtt: number;
  jitter: number;
  asn: string;
  country: string;
  city: string;
}

interface MapComponentProps {
  data: LatencyData[];
}

// US bounds for restricting map view
const US_BOUNDS = {
  north: 49.5,
  south: 24.5,
  east: -66.5,
  west: -125.5
};

const POP_COORDS: Record<string, [number, number]> = {
  // Major US PoPs
  IAD: [39.0438, -77.4874], // Ashburn, VA
  ORD: [41.9742, -87.9073], // Chicago, IL
  EWR: [40.6895, -74.1745], // Newark, NJ
  LAX: [33.9416, -118.4085], // Los Angeles, CA
  ATL: [33.6407, -84.4277], // Atlanta, GA
  DFW: [32.8998, -97.0403], // Dallas, TX
  
  // Additional US PoPs
  ABQ: [35.0844, -106.6504], // Albuquerque, NM
  ANC: [61.2181, -149.9003], // Anchorage, AK
  AUS: [30.2672, -97.7431], // Austin, TX
  BGR: [44.8076, -68.7711], // Bangor, ME
  BOS: [42.3601, -71.0589], // Boston, MA
  BUF: [42.8864, -78.8784], // Buffalo, NY
  CLT: [35.2271, -80.8431], // Charlotte, NC
  CLE: [41.4993, -81.6944], // Cleveland, OH
  CMH: [39.9612, -82.9988], // Columbus, OH
  DEN: [39.7392, -104.9903], // Denver, CO
  DTW: [42.3314, -83.0458], // Detroit, MI
  DUR: [35.9940, -78.8986], // Durham, NC
  HNL: [21.3099, -157.8581], // Honolulu, HI
  IAH: [29.7604, -95.3698], // Houston, TX
  IND: [39.7684, -86.1581], // Indianapolis, IN
  JAX: [30.3322, -81.6557], // Jacksonville, FL
  MCI: [39.0997, -94.5786], // Kansas City, MO
  LAS: [36.1699, -115.1398], // Las Vegas, NV
  MFE: [26.2034, -98.2300], // McAllen, TX
  MEM: [35.1495, -90.0490], // Memphis, TN
  MIA: [25.7617, -80.1918], // Miami, FL
  MSP: [44.9778, -93.2650], // Minneapolis, MN
  BNA: [36.1627, -86.7816], // Nashville, TN
  ORF: [36.8468, -76.2852], // Norfolk, VA
  OKC: [35.4676, -97.5164], // Oklahoma City, OK
  OMA: [41.2565, -95.9345], // Omaha, NE
  PHL: [39.9526, -75.1652], // Philadelphia, PA
  PHX: [33.4484, -112.0740], // Phoenix, AZ
  PIT: [40.4406, -79.9959], // Pittsburgh, PA
  PDX: [45.5152, -122.6784], // Portland, OR
  RIC: [37.5407, -77.4360], // Richmond, VA
  SMF: [38.5816, -121.4944], // Sacramento, CA
  SLC: [40.7608, -111.8910], // Salt Lake City, UT
  SAT: [29.4241, -98.4936], // San Antonio, TX
  SAN: [32.7157, -117.1611], // San Diego, CA
  SFO: [37.7749, -122.4194], // San Francisco, CA
  SJC: [37.3382, -121.8863], // San Jose, CA
  SEA: [47.6062, -122.3321], // Seattle, WA
  FSD: [43.5446, -96.7311], // Sioux Falls, SD
  STL: [38.6270, -90.1994], // St. Louis, MO
  TLH: [30.4518, -84.2807], // Tallahassee, FL
  TPA: [27.9506, -82.4572]  // Tampa, FL
};

// PoP code to city name mapping
const POP_NAMES: Record<string, string> = {
  IAD: 'Ashburn',
  ORD: 'Chicago',
  EWR: 'Newark',
  LAX: 'Los Angeles',
  ATL: 'Atlanta',
  DFW: 'Dallas',
  ABQ: 'Albuquerque',
  ANC: 'Anchorage',
  AUS: 'Austin',
  BGR: 'Bangor',
  BOS: 'Boston',
  BUF: 'Buffalo',
  CLT: 'Charlotte',
  CLE: 'Cleveland',
  CMH: 'Columbus',
  DEN: 'Denver',
  DTW: 'Detroit',
  DUR: 'Durham',
  HNL: 'Honolulu',
  IAH: 'Houston',
  IND: 'Indianapolis',
  JAX: 'Jacksonville',
  MCI: 'Kansas City',
  LAS: 'Las Vegas',
  MFE: 'McAllen',
  MEM: 'Memphis',
  MIA: 'Miami',
  MSP: 'Minneapolis',
  BNA: 'Nashville',
  ORF: 'Norfolk',
  OKC: 'Oklahoma City',
  OMA: 'Omaha',
  PHL: 'Philadelphia',
  PHX: 'Phoenix',
  PIT: 'Pittsburgh',
  PDX: 'Portland',
  RIC: 'Richmond',
  SMF: 'Sacramento',
  SLC: 'Salt Lake City',
  SAT: 'San Antonio',
  SAN: 'San Diego',
  SFO: 'San Francisco',
  SJC: 'San Jose',
  SEA: 'Seattle',
  FSD: 'Sioux Falls',
  STL: 'St. Louis',
  TLH: 'Tallahassee',
  TPA: 'Tampa'
};

function MapComponent({ data }: MapComponentProps) {
  const getMarkerColor = (avgRtt: number) => {
    return avgRtt < 50 ? '#10B981' : avgRtt < 100 ? '#F59E0B' : '#EF4444';
  };

  const getMarkerRadius = (avgRtt: number) => {
    return avgRtt < 50 ? 8 : avgRtt < 100 ? 6 : 5;
  };

  return (
    <div className="leaflet-map-container">
      <div className="map-header">
        <h3>US Cloudflare Network</h3>
        <p>Real-time latency measurements across PoPs</p>
      </div>
      
      <div className="map-wrapper">
        <MapContainer
          center={[39.5, -98.35]} // Center of US
          zoom={4}
          style={{ height: '400px', width: '100%', borderRadius: '8px' }}
          maxBounds={[
            [US_BOUNDS.north, US_BOUNDS.west],
            [US_BOUNDS.south, US_BOUNDS.east]
          ]}
          maxBoundsViscosity={1.0}
          zoomControl={false}
          dragging={false}
          doubleClickZoom={false}
          scrollWheelZoom={false}
          touchZoom={false}
          boxZoom={false}
          keyboard={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {Object.entries(POP_COORDS).map(([popCode, coords]) => {
            // Find data for this PoP
            const record = Array.isArray(data) ? data.find(d => d.colo === popCode) : null;
            
            const color = record ? getMarkerColor(record.avg_rtt) : '#9CA3AF'; // Gray for no data
            const radius = record ? getMarkerRadius(record.avg_rtt) : 4; // Smaller for no data

            return (
              <CircleMarker
                key={popCode}
                center={coords}
                radius={radius}
                pathOptions={{
                  color: '#ffffff',
                  fillColor: color,
                  fillOpacity: 0.8,
                  weight: 2,
                  opacity: 1
                }}
              >
                <Popup>
                  <div className="popup-content">
                    <h4>{POP_NAMES[popCode] || popCode}, US</h4>
                    <div className="popup-details">
                      <div className="popup-row">
                        <span className="popup-label">PoP:</span>
                        <span className="popup-value">{popCode}</span>
                      </div>
                      {record ? (
                        <>
                          <div className="popup-row">
                            <span className="popup-label">Avg RTT:</span>
                            <span className="popup-value">{record.avg_rtt} ms</span>
                          </div>
                          <div className="popup-row">
                            <span className="popup-label">Jitter:</span>
                            <span className="popup-value">{record.jitter} ms</span>
                          </div>
                        </>
                      ) : (
                        <div className="popup-row">
                          <span className="popup-label">Status:</span>
                          <span className="popup-value">No data</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
        
        {/* Legend */}
        <div className="map-legend">
          <div className="legend-item">
            <div className="legend-color" style={{backgroundColor: '#10B981'}}></div>
            <span>&lt; 50ms</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{backgroundColor: '#F59E0B'}}></div>
            <span>50-100ms</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{backgroundColor: '#EF4444'}}></div>
            <span>&gt; 100ms</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{backgroundColor: '#9CA3AF'}}></div>
            <span>No data</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapComponent;
