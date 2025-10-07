

import { NextRequest, NextResponse } from 'next/server';

interface LatencyRecord {
  avg_rtt: number;
  jitter: number;
  timestamp: string;
  colo: string;
}

interface PredictionResult {
  colo: string;
  currentPerformance: 'excellent' | 'good' | 'poor' | 'critical';
  predictedCongestion: 'low' | 'medium' | 'high';
  confidence: number;
  recommendations: string[];
  trendAnalysis: string;
  nextHourPrediction: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const colo = searchParams.get('colo');

    if (!colo) {
      return NextResponse.json(
        { error: 'Missing ?colo=XYZ' },
        { status: 400 }
      );
    }

    // Get the D1 database and AI from the environment
    const env = (globalThis as any).env || 
                (globalThis as any).__env__ || 
                (process as any).env;
    const db = env?.DB;
    const ai = env?.AI;

    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    // Fetch recent data for trend analysis
    const result = await db.prepare(
      `SELECT avg_rtt, jitter, timestamp, colo 
       FROM rum_data 
       WHERE colo = ? AND timestamp > datetime('now', '-24 hours')
       ORDER BY timestamp DESC`
    ).bind(colo).all();

    const data: LatencyRecord[] = result.results || [];

    if (data.length === 0) {
      return NextResponse.json(
        { error: `No recent data found for colo ${colo}` },
        { status: 404 }
      );
    }

    // Calculate performance metrics
    const avgRtt = data.reduce((sum, r) => sum + r.avg_rtt, 0) / data.length;
    const avgJitter = data.reduce((sum, r) => sum + r.jitter, 0) / data.length;
    const maxRtt = Math.max(...data.map(r => r.avg_rtt));
    const minRtt = Math.min(...data.map(r => r.avg_rtt));
    
    // Calculate trend (simple linear regression on recent data)
    const recentData = data.slice(0, Math.min(10, data.length));
    const trend = calculateTrend(recentData.map(r => r.avg_rtt));
    
    // Determine performance levels
    const currentPerformance = getPerformanceLevel(avgRtt, avgJitter);
    const predictedCongestion = predictCongestion(trend, avgRtt, avgJitter);
    const confidence = calculateConfidence(data.length, avgJitter);
    
    // Generate AI-powered insights
    let aiInsights: any = '';
    if (ai) {
      try {
        const prompt = `
          You are a Cloudflare network engineer analyzing performance data for PoP ${colo}.
          
          Current metrics (last 24h):
          - Average RTT: ${avgRtt.toFixed(2)}ms (trend: ${trend > 0 ? '+' : ''}${trend.toFixed(2)}ms/hr)
          - Average Jitter: ${avgJitter.toFixed(2)}ms
          - Performance Level: ${currentPerformance}
          - Predicted Congestion: ${predictedCongestion}
          - Data Points: ${data.length}
          
          Provide:
          1. A brief performance assessment (1-2 sentences)
          2. Three specific recommendations for optimization
          3. Risk assessment for the next hour
          
          Format as JSON: {"assessment": "...", "recommendations": ["...", "...", "..."], "risk": "..."}
        `;

        const aiResponse = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 500
        });

        try {
          const aiData = JSON.parse(aiResponse.response);
          aiInsights = aiData;
        } catch {
          aiInsights = { assessment: aiResponse.response, recommendations: [], risk: 'unknown' };
        }
      } catch (aiError) {
        console.error('AI prediction error:', aiError);
      }
    }

    // Generate recommendations if AI fails
    if (!aiInsights || typeof aiInsights === 'string') {
      aiInsights = generateFallbackRecommendations(avgRtt, avgJitter, trend, currentPerformance);
    }

    const prediction: PredictionResult = {
      colo,
      currentPerformance,
      predictedCongestion,
      confidence,
      recommendations: aiInsights.recommendations || [],
      trendAnalysis: aiInsights.assessment || `Performance is ${currentPerformance} with ${avgRtt.toFixed(2)}ms average RTT.`,
      nextHourPrediction: avgRtt + (trend * 1) // Predict next hour based on trend
    };

    return NextResponse.json({
      prediction,
      metrics: {
        avgRtt,
        avgJitter,
        maxRtt,
        minRtt,
        trend,
        dataPoints: data.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Prediction error:', error);
    return NextResponse.json(
      { error: 'Failed to generate predictions' },
      { status: 500 }
    );
  }
}

function calculateTrend(values: number[]): number {
  if (values.length < 2) return 0;
  
  const n = values.length;
  const x = Array.from({length: n}, (_, i) => i);
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
  
  return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
}

function getPerformanceLevel(avgRtt: number, avgJitter: number): 'excellent' | 'good' | 'poor' | 'critical' {
  if (avgRtt < 50 && avgJitter < 10) return 'excellent';
  if (avgRtt < 100 && avgJitter < 20) return 'good';
  if (avgRtt < 200 && avgJitter < 50) return 'poor';
  return 'critical';
}

function predictCongestion(trend: number, avgRtt: number, avgJitter: number): 'low' | 'medium' | 'high' {
  const congestionScore = (trend * 0.4) + ((avgRtt - 50) * 0.003) + (avgJitter * 0.01);
  
  if (congestionScore < 0.5) return 'low';
  if (congestionScore < 1.5) return 'medium';
  return 'high';
}

function calculateConfidence(dataPoints: number, avgJitter: number): number {
  const dataConfidence = Math.min(dataPoints / 50, 1) * 0.6; // More data = higher confidence
  const stabilityConfidence = Math.max(0, 1 - (avgJitter / 100)) * 0.4; // Lower jitter = higher confidence
  
  return Math.round((dataConfidence + stabilityConfidence) * 100);
}

function generateFallbackRecommendations(avgRtt: number, avgJitter: number, trend: number, performance: string): any {
  const recommendations: string[] = [];
  
  if (avgRtt > 100) {
    recommendations.push('Consider traffic steering to nearby PoPs with better performance');
  }
  
  if (avgJitter > 20) {
    recommendations.push('Investigate network stability and routing optimization');
  }
  
  if (trend > 5) {
    recommendations.push('Monitor for potential capacity issues or network congestion');
  } else if (trend < -5) {
    recommendations.push('Performance improving - consider scaling up this PoP');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Performance is optimal - maintain current configuration');
  }
  
  return {
    assessment: `Current performance is ${performance} with ${avgRtt.toFixed(2)}ms average RTT and ${avgJitter.toFixed(2)}ms jitter.`,
    recommendations,
    risk: trend > 10 ? 'high' : trend > 0 ? 'medium' : 'low'
  };
}
