export async function onRequest(context) {
  const asn = context.request.cf?.asn || "UNK";
  const country = context.request.cf?.country || "UNK";
  const city = context.request.cf?.city || "UNK";
  const colo = context.request.cf?.colo || "UNK";

  return new Response(
    JSON.stringify({ msg: "pong", asn, country, city, colo }),
    { headers: { "Content-Type": "application/json" } }
  );
}
