import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  // Get Cloudflare headers from the request
  const cf = (request as any).cf;
  
  // Get CF headers that are actually available in Pages
  const cfRay = request.headers.get('cf-ray');
  const cfVisitor = request.headers.get('cf-visitor');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  const cfIpCountry = request.headers.get('cf-ipcountry');
  const cfIpCity = request.headers.get('cf-ipcity');
  const cfIpRegion = request.headers.get('cf-ipregion');
  const cfIpCountryCode = request.headers.get('cf-ipcountrycode');
  const cfIpCityCode = request.headers.get('cf-ipcitycode');
  const cfIpRegionCode = request.headers.get('cf-ipregioncode');
  const cfIpContinent = request.headers.get('cf-ipcontinent');
  const cfIpCityLatitude = request.headers.get('cf-ipcitylatitude');
  const cfIpCityLongitude = request.headers.get('cf-ipcitylongitude');
  
  // Debug logging to see what's actually available
  console.log('CF Object available:', cf);
  console.log('CF Headers available:', {
    cfRay,
    cfVisitor,
    cfConnectingIp,
    cfIpCountry,
    cfIpCity,
    cfIpRegion,
    cfIpCountryCode,
    cfIpCityCode,
    cfIpRegionCode,
    cfIpContinent,
    cfIpCityLatitude,
    cfIpCityLongitude
  });
  
  // Try CF object first (if available), then fall back to CF headers
  let asn, country, city, colo;
  
  if (cf && (cf.asn || cf.country || cf.city || cf.colo)) {
    // Use CF object if available (like in Workers)
    asn = cf.asn || "UNK";
    country = cf.country || "UNK";
    city = cf.city || "UNK";
    colo = cf.colo || "UNK";
    console.log('Using CF object:', { asn, country, city, colo });
  } else if (cfIpCountry || cfIpCity || cfIpRegion) {
    // Use CF headers that are available in Pages
    asn = "UNK"; // ASN not available in standard CF headers
    country = cfIpCountry || "UNK";
    city = cfIpCity || "UNK";
    colo = "UNK"; // Colo not available in standard CF headers
    console.log('Using CF headers:', { asn, country, city, colo });
  } else {
    // Fallback to unknown
    asn = "UNK";
    country = "UNK";
    city = "UNK";
    colo = "UNK";
    console.log('No CF data available, using UNK');
  }
  
  return NextResponse.json({
    msg: "pong", 
    asn, 
    country, 
    city, 
    colo
  });
}
