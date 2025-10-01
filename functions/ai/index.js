export async function onRequestGet(context) {
    const { DB } = context.env;
    const url = new URL(context.request.url);
    const colo = url.searchParams.get("colo");

    if (!colo) {
        return new Response(JSON.stringify({error: "Missing ?colo=XYZ"}), {
            status: 400,
            headers: {"Content-Type": "application/json"}
        });
    }
    // fetch last 100 entries (6 hours)
    const query = await DB.prepare(
      "SELECT avg_rtt, jitter FROM rum_data WHERE colo = ? ORDER BY timestamp DESC LIMIT 20"
    ).bind(colo).all();

    const rows = query.results; // <-- array of rows

    if (!rows || rows.length === 0) {
      return new Response(
        JSON.stringify({ error: "No data found for colo " + colo }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const avgRtt = rows.reduce((sum, r) => sum + parseFloat(r.avg_rtt), 0) / rows.length;
    const avgJitter = rows.reduce((sum, r) => sum + parseFloat(r.jitter), 0) / rows.length;

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

    const aiText = aiRes?.response || "⚠️ No AI response available";

    return new Response(JSON.stringify({
        colo,
        insights: aiText,
        summary: { avgRtt, avgJitter, count: rows.length }
    }), { headers: { "Content-Type": "application/json" } });
}



