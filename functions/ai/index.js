export async function onRequestGet(context) {
    const { DB } = context.env;
    const url = new URL(context.env.url);
    const colo = url.searchParams.get("colo");

    if (!colo) {
        return new Response(JSON.stringify({error: "Missing ?colo=XYZ"}), {
            status: 400,
            headers: {"Content-Type": "application/json"}
        });
    }
    // fetch last 100 entries (6 hours)
    const results = await DB.prepare(
        "SELECT * FROM rum_data WHERE colo = ? ORDER BY timestamp DESC LIMIT 100"
    ).bind(colo).all();

    if (results.length === 0) {
    return new Response(JSON.stringify({
      insights: `No data found for ${colo}.`,
      summary: { count: 0 }
    }), { headers: { "Content-Type": "application/json" } });
  }

    const avgRtt = results.reduce((sum, r) => sum + parseFloat(r.avg_rtt), 0) / results.length;
    const avgJitter = results.reduce((sum, r) => sum + parseFloat(r.jitter), 0) / results.length;

      // build prompt, simple
    const prompt = `
    You are analyzing latency data for Cloudflare PoP ${colo}.
    Recent 100 entries show average RTT = ${avgRtt.toFixed(2)} ms,
    average Jitter = ${avgJitter.toFixed(2)} ms.
    Make a concise human-friendly insight about this PoP's performance.
    `;

    const aiRes = await context.env.AI.run("@cf/meta/llama-2-7b-chat-int8", {
        messages: [{ role: "user", content: prompt }],
    });

    return new Response(JSON.stringify({
        colo,
        insights: aiRes.result.response,
        summary: { avgRtt, avgJitter, count: results.length }
    }), { headers: { "Content-Type": "application/json" } });
}



