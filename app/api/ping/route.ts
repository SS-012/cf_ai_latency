import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  // Get Cloudflare context using the proper method for Next.js on Pages
  let cf;
  
  try {
    // Method 1: Try request.cf directly
    cf = (request as any).cf;
    
    // Method 2: Try to get from the Cloudflare context
    if (!cf && typeof globalThis !== 'undefined') {
      // Check if we're in a Cloudflare environment
      const cloudflareRequest = (globalThis as any).request;
      if (cloudflareRequest?.cf) {
        cf = cloudflareRequest.cf;
      }
    }
    
    // Method 3: Try to access CF data through the request context
    if (!cf) {
      // In Cloudflare Pages, the CF data might be attached differently
      const requestContext = (request as any).context || (request as any).env;
      if (requestContext?.cf) {
        cf = requestContext.cf;
      }
    }
    
    // Method 4: Try to get CF data from the runtime environment
    if (!cf && typeof globalThis !== 'undefined') {
      // Check for Cloudflare-specific globals
      const cfGlobals = ['__CF$context', 'CF$context', 'cloudflare'];
      for (const globalName of cfGlobals) {
        if ((globalThis as any)[globalName]?.cf) {
          cf = (globalThis as any)[globalName].cf;
          break;
        }
      }
    }
  } catch (error) {
    console.log('Error accessing CF context:', error);
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
  
  // Get Vercel headers (these contain actual location data!)
  const xVercelIpCity = request.headers.get('x-vercel-ip-city');
  const xVercelIpCountry = request.headers.get('x-vercel-ip-country');
  const xVercelIpCountryRegion = request.headers.get('x-vercel-ip-country-region');
  const xVercelIpLatitude = request.headers.get('x-vercel-ip-latitude');
  const xVercelIpLongitude = request.headers.get('x-vercel-ip-longitude');
  const xRealIp = request.headers.get('x-real-ip');
  
  // Debug logging to see what's actually available
  console.log('=== DEBUG INFO ===');
  console.log('CF Object available:', cf);
  console.log('Request object keys:', Object.keys(request));
  console.log('Request prototype:', Object.getPrototypeOf(request));
  console.log('Request constructor:', request.constructor.name);
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
  
  // Try to access CF data through different methods
  console.log('=== CF ACCESS ATTEMPTS ===');
  console.log('Method 1 - request.cf:', (request as any).cf);
  console.log('Method 2 - request.context:', (request as any).context);
  console.log('Method 3 - request.env:', (request as any).env);
  console.log('Method 4 - globalThis.request:', (globalThis as any).request?.cf);
  console.log('Method 5 - process.env.cf:', (process as any).env?.cf);
  
  // Priority: CF object > CF headers > Vercel headers > fallback
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
  } else if (xVercelIpCountry || xVercelIpCity) {
    // Use Vercel headers (these actually have the location data!)
    asn = "UNK"; // ASN not available in Vercel headers
    country = xVercelIpCountry || "UNK";
    // Decode the city name (it's URL encoded)
    city = xVercelIpCity ? decodeURIComponent(xVercelIpCity) : "UNK";
    colo = "UNK"; // Colo not available in Vercel headers
    console.log('Using Vercel headers:', { asn, country, city, colo, raw: { xVercelIpCity, xVercelIpCountry, xVercelIpCountryRegion } });
  } else {
    // Fallback to unknown
    asn = "UNK";
    country = "UNK";
    city = "UNK";
    colo = "UNK";
    console.log('No location data available, using UNK');
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
      vercelHeaders: {
        xVercelIpCity,
        xVercelIpCountry,
        xVercelIpCountryRegion,
        xVercelIpLatitude,
        xVercelIpLongitude,
        xRealIp
      },
      allHeaders: Array.from(request.headers.keys()).filter(h => h.startsWith('cf-')),
      allRequestHeaders: Array.from(request.headers.entries()),
      globalThisKeys: Object.keys(globalThis).filter(k => k.includes('cf') || k.includes('CF')),
      requestKeys: Object.keys(request)
    }
  });
}
