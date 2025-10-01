export async function onRequest(context) {
  const body = await context.request.json();

  await context.env.DB.prepare(
    `INSERT INTO rum_data (colo, timestamp, avg_rtt, jitter, asn, country, city)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      body.colo,
      body.timestamp,
      body.avg_rtt,
      body.jitter,
      body.asn,
      body.country,
      body.city
    )
    .run();

  return new Response(JSON.stringify({ status: "ok" }), {
    headers: { "Content-Type": "application/json" }
  });
}
