'use client';

interface MetricsCardsProps {
  metrics: {
    avgRtt: string;
    jitter: string;
    asn: string;
    location: string;
    colo: string;
  };
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  return (
    <div className="cards">
      <div className="card">
        <h2>Average RTT</h2>
        <p>{metrics.avgRtt}</p>
      </div>
      <div className="card">
        <h2>Jitter</h2>
        <p>{metrics.jitter}</p>
      </div>
      <div className="card">
        <h2>ASN</h2>
        <p>{metrics.asn}</p>
      </div>
      <div className="card">
        <h2>Location</h2>
        <p>{metrics.location}</p>
      </div>
      <div className="card">
        <h2>PoP</h2>
        <p>{metrics.colo}</p>
      </div>
    </div>
  );
}
