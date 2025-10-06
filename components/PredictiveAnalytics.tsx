'use client';

import React, { useState, useEffect } from 'react';

interface PredictionData {
  colo: string;
  currentPerformance: 'excellent' | 'good' | 'poor' | 'critical';
  predictedCongestion: 'low' | 'medium' | 'high';
  confidence: number;
  recommendations: string[];
  trendAnalysis: string;
  nextHourPrediction: number;
  metrics: {
    avgRtt: number;
    avgJitter: number;
    maxRtt: number;
    minRtt: number;
    trend: number;
    dataPoints: number;
  };
  timestamp: string;
}

interface AnalyticsOverview {
  totalPoPs: number;
  excellentPoPs: number;
  goodPoPs: number;
  poorPoPs: number;
  criticalPoPs: number;
  averageConfidence: number;
  topPerformingPoPs: string[];
  atRiskPoPs: string[];
}

export function PredictiveAnalytics() {
  const [selectedColo, setSelectedColo] = useState('IAD');
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null);
  const [analyticsOverview, setAnalyticsOverview] = useState<AnalyticsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const popCodes = [
    'IAD', 'ORD', 'EWR', 'LAX', 'ATL', 'DFW', 'ABQ', 'ANC', 'AUS', 'BGR',
    'BOS', 'BUF', 'CLT', 'CLE', 'CMH', 'DEN', 'DTW', 'DUR', 'HNL', 'IAH',
    'IND', 'JAX', 'MCI', 'LAS', 'MFE', 'MEM', 'MIA', 'MSP', 'BNA', 'ORF',
    'OKC', 'OMA', 'PHL', 'PHX', 'PIT', 'PDX', 'RIC', 'SMF', 'SLC', 'SAT',
    'SAN', 'SFO', 'SJC', 'SEA', 'FSD', 'STL', 'TLH', 'TPA'
  ];

  const getPrediction = async (colo: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/ai/predict?colo=${colo}`);
      const data = await response.json();
      
      if (response.ok) {
        setPredictionData(data.prediction);
      } else {
        setError(data.error || 'Failed to fetch prediction');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getAnalyticsOverview = async () => {
    try {
      // This would call a real endpoint that aggregates all PoP predictions
      // For now, we'll simulate the data
      const overview: AnalyticsOverview = {
        totalPoPs: popCodes.length,
        excellentPoPs: Math.floor(popCodes.length * 0.4),
        goodPoPs: Math.floor(popCodes.length * 0.35),
        poorPoPs: Math.floor(popCodes.length * 0.2),
        criticalPoPs: Math.floor(popCodes.length * 0.05),
        averageConfidence: 87,
        topPerformingPoPs: ['IAD', 'ORD', 'LAX', 'SFO', 'SEA'],
        atRiskPoPs: ['MIA', 'ATL', 'DFW']
      };
      
      setAnalyticsOverview(overview);
    } catch (err) {
      console.error('Failed to fetch analytics overview:', err);
    }
  };

  useEffect(() => {
    getPrediction(selectedColo);
    getAnalyticsOverview();
  }, [selectedColo]);

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return '#10B981';
      case 'good': return '#3B82F6';
      case 'poor': return '#F59E0B';
      case 'critical': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getCongestionColor = (congestion: string) => {
    switch (congestion) {
      case 'low': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 2) return '📈'; // Rising
    if (trend < -2) return '📉'; // Falling
    return '➡️'; // Stable
  };

  return (
    <div className="predictive-analytics">
      <div className="analytics-header">
        <h2>Predictive Network Analytics</h2>
        <p>AI-powered congestion prediction and performance forecasting</p>
      </div>

      {analyticsOverview && (
        <div className="overview-cards">
          <div className="overview-card">
            <h3>Network Overview</h3>
            <div className="overview-stats">
              <div className="stat">
                <span className="stat-label">Total PoPs</span>
                <span className="stat-value">{analyticsOverview.totalPoPs}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Excellent</span>
                <span className="stat-value excellent">{analyticsOverview.excellentPoPs}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Good</span>
                <span className="stat-value good">{analyticsOverview.goodPoPs}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Poor</span>
                <span className="stat-value poor">{analyticsOverview.poorPoPs}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Critical</span>
                <span className="stat-value critical">{analyticsOverview.criticalPoPs}</span>
              </div>
            </div>
          </div>

          <div className="overview-card">
            <h3>Risk Assessment</h3>
            <div className="risk-info">
              <div className="risk-item">
                <span className="risk-label">Avg Confidence</span>
                <span className="risk-value">{analyticsOverview.averageConfidence}%</span>
              </div>
              <div className="risk-item">
                <span className="risk-label">At Risk PoPs</span>
                <span className="risk-value">{analyticsOverview.atRiskPoPs.join(', ')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="prediction-section">
        <div className="prediction-controls">
          <select 
            value={selectedColo} 
            onChange={(e) => setSelectedColo(e.target.value)}
            className="colo-selector"
          >
            {popCodes.map(code => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
          <button 
            onClick={() => getPrediction(selectedColo)}
            disabled={isLoading}
            className="refresh-button"
          >
            {isLoading ? 'Analyzing...' : 'Refresh Analysis'}
          </button>
        </div>

        {error && (
          <div className="error-message">
            Error: {error}
          </div>
        )}

        {predictionData && (
          <div className="prediction-results">
            <div className="prediction-header">
              <h3>Analysis for {predictionData.colo}</h3>
              <div className="confidence-badge">
                Confidence: {predictionData.confidence}%
              </div>
            </div>

            <div className="prediction-metrics">
              <div className="metric-card">
                <div className="metric-label">Current Performance</div>
                <div 
                  className="metric-value"
                  style={{ color: getPerformanceColor(predictionData.currentPerformance) }}
                >
                  {predictionData.currentPerformance.toUpperCase()}
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-label">Predicted Congestion</div>
                <div 
                  className="metric-value"
                  style={{ color: getCongestionColor(predictionData.predictedCongestion) }}
                >
                  {predictionData.predictedCongestion.toUpperCase()}
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-label">Next Hour RTT</div>
                <div className="metric-value">
                  {predictionData.nextHourPrediction.toFixed(1)}ms
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-label">Trend</div>
                <div className="metric-value">
                  {getTrendIcon(predictionData.metrics.trend)} 
                  {predictionData.metrics.trend.toFixed(2)}ms/hr
                </div>
              </div>
            </div>

            <div className="detailed-metrics">
              <h4>Detailed Metrics</h4>
              <div className="metrics-grid">
                <div className="metric-item">
                  <span className="metric-name">Average RTT</span>
                  <span className="metric-number">{predictionData.metrics.avgRtt.toFixed(2)}ms</span>
                </div>
                <div className="metric-item">
                  <span className="metric-name">Average Jitter</span>
                  <span className="metric-number">{predictionData.metrics.avgJitter.toFixed(2)}ms</span>
                </div>
                <div className="metric-item">
                  <span className="metric-name">Max RTT</span>
                  <span className="metric-number">{predictionData.metrics.maxRtt.toFixed(2)}ms</span>
                </div>
                <div className="metric-item">
                  <span className="metric-name">Min RTT</span>
                  <span className="metric-number">{predictionData.metrics.minRtt.toFixed(2)}ms</span>
                </div>
                <div className="metric-item">
                  <span className="metric-name">Data Points</span>
                  <span className="metric-number">{predictionData.metrics.dataPoints}</span>
                </div>
              </div>
            </div>

            <div className="recommendations">
              <h4>AI Recommendations</h4>
              <ul className="recommendations-list">
                {predictionData.recommendations.map((rec, index) => (
                  <li key={index} className="recommendation-item">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            <div className="trend-analysis">
              <h4>Trend Analysis</h4>
              <p className="trend-text">{predictionData.trendAnalysis}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
