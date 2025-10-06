'use client';

import { useState } from 'react';

export function AIInsights() {
  const [selectedColo, setSelectedColo] = useState('IAD');
  const [aiOutput, setAiOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getInsights = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/ai?colo=${selectedColo}`);
      const text = await res.text();
      console.log("AI raw response:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        setAiOutput(
          `❌ Error: Response was not JSON\n\n${text}`
        );
        return;
      }

      setAiOutput(
        `PoP: ${selectedColo}\n` +
        `Avg RTT: ${data.summary?.avgRtt?.toFixed?.(2) || "N/A"} ms\n` +
        `Jitter: ${data.summary?.avgJitter?.toFixed?.(2) || "N/A"} ms\n` +
        `Count: ${data.summary?.count || "N/A"}\n\n` +
        `🤖 AI Insight: ${data.insights || "No insights available"}`
      );
    } catch (error) {
      setAiOutput(`❌ Error fetching insights: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-section">
      <h2>AI Insights</h2>
      <select 
        value={selectedColo} 
        onChange={(e) => setSelectedColo(e.target.value)}
      >
        <option value="IAD">Ashburn (IAD)</option>
        <option value="ORD">Chicago (ORD)</option>
        <option value="EWR">Newark (EWR)</option>
      </select>
      <button 
        onClick={getInsights} 
        disabled={isLoading}
        className="test-button"
      >
        {isLoading ? 'Loading...' : 'Get Insights'}
      </button>
      {aiOutput && <pre className="ai-output">{aiOutput}</pre>}
    </div>
  );
}
