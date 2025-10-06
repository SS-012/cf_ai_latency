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
  
  // Check for Cloudflare headers (both original CF object and worker-injected headers)
  if ((cf && (cf.asn || cf.country || cf.city || cf.colo)) || 
      (cfAsn || cfCountry || cfCity || cfColo)) {
    
    // Use worker-injected headers first, then fall back to original CF object
    const asn = cfAsn || cf?.asn || 'Unknown';
    const country = cfCountry || cf?.country || 'Unknown';
    const city = cfCity || cf?.city || 'Unknown';
    const colo = cfColo || cf?.colo || 'Unknown';
    const region = cfRegion || cf?.region || 'Unknown';
    const timezone = cfTimezone || cf?.timezone || 'Unknown';
    const latitude = cfLatitude || cf?.latitude || null;
    const longitude = cfLongitude || cf?.longitude || null;
    
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
