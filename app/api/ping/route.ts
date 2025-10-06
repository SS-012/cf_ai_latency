import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  // Get Cloudflare headers from the request
  const cf = (request as any).cf;
  
  // Check for CF headers injected by our worker
  const cfAsn = request.headers.get('cf-asn');
  const cfCountry = request.headers.get('cf-country');
  const cfCity = request.headers.get('cf-city');
  const cfColo = request.headers.get('cf-colo');
  const cfRegion = request.headers.get('cf-region');
  const cfTimezone = request.headers.get('cf-timezone');
  const cfLatitude = request.headers.get('cf-latitude');
  const cfLongitude = request.headers.get('cf-longitude');
  
  // Also check standard CF headers that are often available in Pages
  const cfIpCountry = request.headers.get('cf-ipcountry');
  const cfIpCity = request.headers.get('cf-ipcity');
  const cfIpRegion = request.headers.get('cf-ipregion');
  const cfIpCountryCode = request.headers.get('cf-ipcountrycode');
  const cfIpCityCode = request.headers.get('cf-ipcitycode');
  const cfIpRegionCode = request.headers.get('cf-ipregioncode');
  const cfIpContinent = request.headers.get('cf-ipcontinent');
  const cfIpCityLatitude = request.headers.get('cf-ipcitylatitude');
  const cfIpCityLongitude = request.headers.get('cf-ipcitylongitude');
  const cfRay = request.headers.get('cf-ray');
  
  // Debug logging to understand what's available
  console.log('CF Headers available:', {
    cf: !!cf,
    cfAsn,
    cfCountry,
    cfCity,
    cfColo,
    cfRegion,
    cfTimezone,
    cfLatitude,
    cfLongitude,
    // Standard CF headers
    cfIpCountry,
    cfIpCity,
    cfIpRegion,
    cfIpCountryCode,
    cfIpCityCode,
    cfIpRegionCode,
    cfIpContinent,
    cfIpCityLatitude,
    cfIpCityLongitude,
    cfRay,
    // Also check original CF object
    originalCf: {
      asn: cf?.asn,
      country: cf?.country,
      city: cf?.city,
      colo: cf?.colo,
      region: cf?.region,
      timezone: cf?.timezone,
      latitude: cf?.latitude,
      longitude: cf?.longitude
    }
  });
  
  // Check for Cloudflare headers (original CF object, worker-injected, or standard CF headers)
  if ((cf && (cf.asn || cf.country || cf.city || cf.colo)) || 
      (cfAsn || cfCountry || cfCity || cfColo) ||
      (cfIpCountry || cfIpCity || cfIpRegion)) {
    
    // Priority: worker-injected headers > original CF object > standard CF headers
    const asn = cfAsn || cf?.asn || 'Unknown';
    const country = cfCountry || cf?.country || cfIpCountry || 'Unknown';
    const city = cfCity || cf?.city || cfIpCity || 'Unknown';
    const colo = cfColo || cf?.colo || 'Unknown';
    const region = cfRegion || cf?.region || cfIpRegion || 'Unknown';
    const timezone = cfTimezone || cf?.timezone || 'Unknown';
    const latitude = cfLatitude || cf?.latitude || (cfIpCityLatitude ? parseFloat(cfIpCityLatitude) : null);
    const longitude = cfLongitude || cf?.longitude || (cfIpCityLongitude ? parseFloat(cfIpCityLongitude) : null);
    
    console.log('Using CF data:', { asn, country, city, colo, region, timezone, latitude, longitude });
    
    return NextResponse.json({
      msg: 'pong',
      asn,
      country,
      city,
      colo,
      region,
      timezone,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      source: cfAsn ? 'worker-injected' : 'original-cf'
    });
  } else {
    // Fallback: Try to get location from other headers or use geolocation
    const userAgent = request.headers.get('user-agent') || '';
    const acceptLanguage = request.headers.get('accept-language') || '';
    const xForwardedFor = request.headers.get('x-forwarded-for') || '';
    const xRealIp = request.headers.get('x-real-ip') || '';
    
    console.log('Using fallback - Headers:', {
      userAgent: userAgent.substring(0, 100),
      acceptLanguage,
      xForwardedFor,
      xRealIp,
      availableHeaders: Array.from(request.headers.keys()).filter(h => h.startsWith('cf-'))
    });
    
    // For production, we should not use random mock data
    // Instead, return a message indicating location detection failed
    return NextResponse.json({
      msg: 'pong',
      asn: 'Unknown',
      country: 'Unknown', 
      city: 'Unknown',
      colo: 'Unknown',
      error: 'Location detection unavailable - CF headers not found',
      debug: {
        cfObject: !!cf,
        workerHeaders: !!cfAsn,
        availableHeaders: Array.from(request.headers.keys()).filter(h => h.startsWith('cf-'))
      }
    });
  }
}
