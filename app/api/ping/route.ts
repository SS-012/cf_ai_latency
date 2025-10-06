import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  // Try multiple ways to get Cloudflare context
  let cf = (request as any).cf;
  
  // Try to get context from globalThis if available
  if (!cf && typeof globalThis !== 'undefined') {
    cf = (globalThis as any).request?.cf || (globalThis as any).cf;
  }
  
  // Try to get from process.env if available
  if (!cf && typeof process !== 'undefined' && process.env) {
    cf = (process as any).env?.cf;
  }
  
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
  console.log('=== DEBUG INFO ===');
  console.log('CF Object available:', cf);
  console.log('Request object keys:', Object.keys(request));
  console.log('globalThis keys:', Object.keys(globalThis).filter(k => k.includes('cf') || k.includes('CF')));
  console.log('All request headers:', Array.from(request.headers.entries()));
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
  
  // Return debug info in the response to see what's happening
  return NextResponse.json({
    msg: "pong", 
    asn, 
    country, 
    city, 
    colo,
    debug: {
      cfObject: cf,
      cfHeaders: {
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
      },
      allHeaders: Array.from(request.headers.keys()).filter(h => h.startsWith('cf-')),
      allRequestHeaders: Array.from(request.headers.entries()),
      globalThisKeys: Object.keys(globalThis).filter(k => k.includes('cf') || k.includes('CF')),
      requestKeys: Object.keys(request)
    }
  });
}
