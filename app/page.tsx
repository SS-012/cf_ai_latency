'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { LatencyChart } from '@/components/LatencyChart';
import { MetricsCards } from '@/components/MetricsCards';
import { AIInsights } from '@/components/AIInsights';
import { NetworkChat } from '@/components/NetworkChat';
import { PredictiveAnalytics } from '@/components/PredictiveAnalytics';

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff7f0', borderRadius: '8px', border: '1px solid #f38020' }}>Loading map...</div>
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

interface PingResponse {
  asn: string;
  city: string;
  country: string;
  colo: string;
}

export default function Home() {
  const [metrics, setMetrics] = useState({
    avgRtt: '--',
    jitter: '--',
    asn: '--',
    location: '--',
    colo: '--'
  });
  const [rttData, setRttData] = useState<number[]>([]);
  const [mapData, setMapData] = useState<LatencyData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getTimestamp = () => {
    return new Date().toLocaleString();
  };

  const measureEdgeLatency = async () => {
    setIsLoading(true);
    const iterations = 15;
    let avg_rtt = 0;
    let diff_sum = 0;
    let jitter = 0;
    let prev: number | null = null;
    let data: PingResponse | null = null;
    const rtts: number[] = [];

    try {
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        const res = await fetch("/ping");
        const end = performance.now();
        data = await res.json();
        const rtt = end - start;
        rtts.push(rtt);

        avg_rtt += (rtt - avg_rtt) / (i + 1);
        if (i > 0 && prev !== null) {
          const diff = Math.abs(rtt - prev);
          diff_sum += diff;
          jitter = diff_sum / i;
        }
        prev = rtt;
      }

      setMetrics({
        avgRtt: avg_rtt.toFixed(2) + " ms",
        jitter: jitter.toFixed(2) + " ms",
        asn: data?.asn || '--',
        location: `${data?.city || ''}, ${data?.country || ''}`,
        colo: data?.colo || '--'
      });

      setRttData(rtts);

      // Save data
      if (data) {
        await fetch("/api/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            colo: data.colo,
            timestamp: getTimestamp(),
            avg_rtt: avg_rtt.toFixed(2),
            jitter: jitter.toFixed(2),
            asn: data.asn,
            country: data.country,
            city: data.city
          })
        });

        // Update map data
        await updateMapData();
      }
    } catch (error) {
      console.error('Error measuring latency:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateMapData = async () => {
    try {
      const res = await fetch("/api/all_data");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const records = await res.json();
      setMapData(Array.isArray(records) ? records : []);
    } catch (error) {
      console.error("Map update failed:", error);
      setMapData([]); // Set empty array on error
    }
  };

  useEffect(() => {
    updateMapData();
  }, []);

  return (
    <div className="container">
      {/* Header Section */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1>Cloudflare Edge Network Intelligence</h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginTop: '0.5rem' }}>
          Real-time monitoring and AI-powered network optimization
        </p>
      </div>

      {/* Control Section */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <button 
          id="testBtn" 
          onClick={measureEdgeLatency}
          disabled={isLoading}
          className="test-button"
        >
          {isLoading ? 'Analyzing Network...' : 'Run Network Analysis'}
        </button>
      </div>

      {/* Metrics Dashboard */}
      <MetricsCards metrics={metrics} />

      {/* Main Dashboard */}
      <div className="main-content">
        <div className="tester-section">
          <div className="chart-container">
            <LatencyChart data={rttData} />
          </div>
          <AIInsights />
        </div>
        
        <div className="map-section">
          <MapComponent data={mapData} />
        </div>
      </div>

      {/* Advanced AI Features Section */}
      <div className="ai-features-section">
        <h2>Advanced Network Intelligence</h2>
        
        <div className="features-grid">
          <div className="feature-card">
            <h3>AI Network Assistant</h3>
            <NetworkChat />
          </div>
          
          <div className="feature-card">
            <h3>Predictive Analytics Engine</h3>
            <PredictiveAnalytics />
          </div>
        </div>
      </div>
    </div>
  );
}
