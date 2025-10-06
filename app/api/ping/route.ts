import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  // Get Cloudflare headers from the request
  const cf = (request as any).cf;
  
  if (cf && cf.asn && cf.country && cf.city && cf.colo) {
    // Real Cloudflare data
    return NextResponse.json({
      msg: 'pong',
      asn: cf.asn,
      country: cf.country,
      city: cf.city,
      colo: cf.colo
    });
  } else {
    // Enhanced fallback for local development with realistic mock data
    const mockData = [
      { asn: 'AS13335', country: 'US', city: 'Ashburn', colo: 'IAD' },
      { asn: 'AS13335', country: 'US', city: 'Chicago', colo: 'ORD' },
      { asn: 'AS13335', country: 'US', city: 'Newark', colo: 'EWR' },
      { asn: 'AS13335', country: 'US', city: 'Los Angeles', colo: 'LAX' },
      { asn: 'AS13335', country: 'US', city: 'Atlanta', colo: 'ATL' },
      { asn: 'AS13335', country: 'US', city: 'Dallas', colo: 'DFW' }
    ];
    
    // Randomly select a mock PoP to simulate different edge locations
    const selected = mockData[Math.floor(Math.random() * mockData.length)];
    
    return NextResponse.json({
      msg: 'pong',
      asn: selected.asn,
      country: selected.country,
      city: selected.city,
      colo: selected.colo
    });
  }
}
