import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  // Get all headers
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  // Get CF object if available
  const cf = (request as any).cf;

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    url: request.url,
    method: request.method,
    cf: cf || 'not available',
    headers: headers,
    cfHeaders: {
      // Core CF headers
      'cf-ray': request.headers.get('cf-ray'),
      'cf-visitor': request.headers.get('cf-visitor'),
      'cf-connecting-ip': request.headers.get('cf-connecting-ip'),
      
      // Location headers
      'cf-ipcountry': request.headers.get('cf-ipcountry'),
      'cf-ipcity': request.headers.get('cf-ipcity'),
      'cf-ipregion': request.headers.get('cf-ipregion'),
      'cf-ipregioncode': request.headers.get('cf-ipregioncode'),
      'cf-ipcountrycode': request.headers.get('cf-ipcountrycode'),
      'cf-ipcontinent': request.headers.get('cf-ipcontinent'),
      'cf-ipcitycode': request.headers.get('cf-ipcitycode'),
      'cf-ipcityregion': request.headers.get('cf-ipcityregion'),
      'cf-ipcityregioncode': request.headers.get('cf-ipcityregioncode'),
      'cf-ipcitycountry': request.headers.get('cf-ipcitycountry'),
      'cf-ipcitycountrycode': request.headers.get('cf-ipcitycountrycode'),
      'cf-ipcitycontinent': request.headers.get('cf-ipcitycontinent'),
      'cf-ipcitycontinentcode': request.headers.get('cf-ipcitycontinentcode'),
      'cf-ipcitypostalcode': request.headers.get('cf-ipcitypostalcode'),
      'cf-ipcitytimezone': request.headers.get('cf-ipcitytimezone'),
      'cf-ipcitylatitude': request.headers.get('cf-ipcitylatitude'),
      'cf-ipcitylongitude': request.headers.get('cf-ipcitylongitude'),
      'cf-ipcitymetrocode': request.headers.get('cf-ipcitymetrocode'),
      
      // Worker-injected headers (if any)
      'cf-asn': request.headers.get('cf-asn'),
      'cf-country': request.headers.get('cf-country'),
      'cf-city': request.headers.get('cf-city'),
      'cf-colo': request.headers.get('cf-colo'),
      'cf-region': request.headers.get('cf-region'),
      'cf-timezone': request.headers.get('cf-timezone'),
      'cf-latitude': request.headers.get('cf-latitude'),
      'cf-longitude': request.headers.get('cf-longitude')
    }
  });
}
