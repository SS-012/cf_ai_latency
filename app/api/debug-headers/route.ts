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
      'cf-ray': request.headers.get('cf-ray'),
      'cf-visitor': request.headers.get('cf-visitor'),
      'cf-connecting-ip': request.headers.get('cf-connecting-ip'),
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
      'cf-ipcitysubdivision': request.headers.get('cf-ipcitysubdivision'),
      'cf-ipcitysubdivisioncode': request.headers.get('cf-ipcitysubdivisioncode'),
      'cf-ipcitysubdivision2': request.headers.get('cf-ipcitysubdivision2'),
      'cf-ipcitysubdivision2code': request.headers.get('cf-ipcitysubdivision2code'),
      'cf-ipcitysubdivision3': request.headers.get('cf-ipcitysubdivision3'),
      'cf-ipcitysubdivision3code': request.headers.get('cf-ipcitysubdivision3code'),
      'cf-ipcitysubdivision4': request.headers.get('cf-ipcitysubdivision4'),
      'cf-ipcitysubdivision4code': request.headers.get('cf-ipcitysubdivision4code'),
      'cf-ipcitysubdivision5': request.headers.get('cf-ipcitysubdivision5'),
      'cf-ipcitysubdivision5code': request.headers.get('cf-ipcitysubdivision5code'),
      'cf-ipcitysubdivision6': request.headers.get('cf-ipcitysubdivision6'),
      'cf-ipcitysubdivision6code': request.headers.get('cf-ipcitysubdivision6code'),
      'cf-ipcitysubdivision7': request.headers.get('cf-ipcitysubdivision7'),
      'cf-ipcitysubdivision7code': request.headers.get('cf-ipcitysubdivision7code'),
      'cf-ipcitysubdivision8': request.headers.get('cf-ipcitysubdivision8'),
      'cf-ipcitysubdivision8code': request.headers.get('cf-ipcitysubdivision8code'),
      'cf-ipcitysubdivision9': request.headers.get('cf-ipcitysubdivision9'),
      'cf-ipcitysubdivision9code': request.headers.get('cf-ipcitysubdivision9code'),
      'cf-ipcitysubdivision10': request.headers.get('cf-ipcitysubdivision10'),
      'cf-ipcitysubdivision10code': request.headers.get('cf-ipcitysubdivision10code')
    }
  });
}
