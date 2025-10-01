export default {
  async scheduled(controller, env, ctx){
    await runMonitor(env);

  }
};

const PING_URL = "https://cf-ai-latency.pages.dev/ping";
const SAVE_URL = "https://cf-ai-latency.pages.dev/save";

async function runMonitor() {
  let iterations = 15;
  let avg_rtt = 0;
  let prev = null;
  let diffSum = 0;
  let data = null;

  const timestamp = new Date().toLocaleString();

  console.log(`\n[${timestamp}] Running latency test...\n`);

  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    const res = await fetch(PING_URL, { cache: "no-store" });
    data = await res.json();
    const end = Date.now();

    const rtt = end - start;
    avg_rtt += (rtt - avg) / (i + 1);

    if (i > 1) {
      diffSum += Math.abs(rtt - prev);
    }
    prev = rtt;
  }

  const jitter = diffSum / (iterations - 2);

  // log to worker
  console.log(`[${timestamp}] Avg RTT: ${avg_rtt.toFixed(2)} ms, Jitter: ${jitter.toFixed(2)} ms, PoP: ${data.colo}`);


  // send results back to /save
  await fetch(SAVE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      colo: data.colo,
      timestamp: timestamp,
      avg_rtt: avg_rtt.toFixed(2),
      jitter: jitter.toFixed(2),
      asn: data.asn,
      country: data.country,
      city: data.city,
    }),
  });
}

