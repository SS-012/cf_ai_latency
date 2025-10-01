export async function onRequestGet(context) {
  const { DB, latency_ai } = context.env; 
  const url = new URL(context.request.url);
  const colo = url.searchParams.get("colo");

  if (!colo) {
    return new Response(JSON.stringify({ error: "Missing ?colo=XYZ" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Fetch last 100 entries for this colo
  const query = await DB.prepare(
    "SELECT avg_rtt, jitter FROM rum_data WHERE colo = ? ORDER BY timestamp DESC LIMIT 20"
  ).bind(colo).all();

  const rows = query.results;

  if (!rows || rows.length === 0) {
    return new Response(
      JSON.stringify({ error: `No data found for colo ${colo}` }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  const avgRtt = rows.reduce((sum, r) => sum + parseFloat(r.avg_rtt), 0) / rows.length;
  const avgJitter = rows.reduce((sum, r) => sum + parseFloat(r.jitter), 0) / rows.length;

  const prompt = `
    You are analyzing latency data for Cloudflare PoP ${colo}.
    Recent ${rows.length} entries show:
    - Average RTT = ${avgRtt.toFixed(2)} ms
    - Average Jitter = ${avgJitter.toFixed(2)} ms
    
    Provide a short human-friendly performance insight (1–2 sentences).
  `;

  const aiRes = await latency_ai.run("@cf/meta/llama-3.1-8b-instruct", {
    messages: [{ role: "user", content: prompt }]
  });

  return new Response(
    JSON.stringify({
      colo,
      insights: aiRes.response,
      summary: { avgRtt, avgJitter, count: rows.length }
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}
