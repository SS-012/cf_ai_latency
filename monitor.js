// monitor.js
import fetch from "node-fetch";

const PING_URL = "https://cf-ai-latency.pages.dev/ping";
const SAVE_URL = "https://cf-ai-latency.pages.dev/save";

function getTimestamp() {
  return new Date().toLocaleString();
}

async function runMonitor() {
  let iterations = 15;
  let avg_rtt = 0;
  let prev = null;
  let diffSum = 0;
  let data = null;

  const timestamp = getTimestamp();
  console.log(`[${timestamp}] Running latency test...\n`);

  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    const res = await fetch(PING_URL, { cache: "no-store" });
    data = await res.json();
    const end = Date.now();

    const rtt = end - start;
    avg_rtt += (rtt - avg_rtt) / (i + 1);

    if (i > 0) {
      diffSum += Math.abs(rtt - prev);
    }
    prev = rtt;

    console.log(`Ping ${i + 1}: ${rtt.toFixed(2)} ms`);
  }

  const jitter = diffSum / (iterations - 1);

  console.log(`\n=== Summary ===`);
  console.log(`Avg RTT: ${avg_rtt.toFixed(2)} ms`);
  console.log(`Jitter: ${jitter.toFixed(2)} ms`);
  console.log(
    `PoP: ${data.colo}, City: ${data.city}, Country: ${data.country}, ASN: ${data.asn}`
  );

  await fetch(SAVE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      colo: data.colo,
      timestamp,
      avg_rtt: avg_rtt.toFixed(2),
      jitter: jitter.toFixed(2),
      asn: data.asn,
      country: data.country,
      city: data.city,
    }),
  });
}

// run immediately when using node
runMonitor().catch((err) => console.error("Monitor failed:", err));
