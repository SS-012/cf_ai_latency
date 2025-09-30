export async function onRequestPost(context) {
  const body = await context.request.json();

  await context.env.DB.prepare(
    `INSERT INTO rum_data (timestamp, avg_rtt, jitter, asn, country, city, colo)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      body.timestamp,
      body.avg_rtt,
      body.jitter,
      body.asn,
      body.country,
      body.city,
      body.colo
    )
    .run();

  return new Response(JSON.stringify({ status: "ok" }), {
    headers: { "Content-Type": "application/json" }
  });
}
