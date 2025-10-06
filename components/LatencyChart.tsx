'use client';

import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LatencyChartProps {
  data: number[];
}

export function LatencyChart({ data }: LatencyChartProps) {
  const labels = data.map((_, i) => "Ping " + (i + 1));

  const chartData = {
    labels,
    datasets: [
      {
        label: "RTT (ms)",
        data: data,
        borderColor: "#f38020",
        backgroundColor: "rgba(243, 128, 32, 0.2)",
        tension: 0.2,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (data.length === 0) {
    return (
      <div style={{ 
        height: '300px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#666'
      }}>
        Run a test to see latency chart
      </div>
    );
  }

  return <Line data={chartData} options={options} />;
}
