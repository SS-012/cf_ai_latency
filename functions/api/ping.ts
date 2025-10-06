// Cloudflare Pages Function - this should have access to request.cf
export async function onRequest(context: any) {
  const { request, env } = context;
  
  // Get CF data - this should work in Pages Functions
  const cf = request.cf;
  
  console.log('Pages Function - CF Object:', cf);
  console.log('Pages Function - All headers:', Array.from(request.headers.entries()));
  
  // Use the same logic as the original working Cloudflare Worker
  const asn = cf?.asn || "UNK";
  const country = cf?.country || "UNK";
  const city = cf?.city || "UNK";
  const colo = cf?.colo || "UNK";
  
  console.log('Pages Function - Extracted data:', { asn, country, city, colo });
  
  return new Response(
    JSON.stringify({
      msg: "pong",
      asn,
      country,
      city,
      colo,
      source: 'pages-function',
      debug: {
        cfObject: cf,
        allHeaders: Array.from(request.headers.entries())
      }
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    }
  );
}
