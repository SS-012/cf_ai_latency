import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // In Cloudflare Pages with Next.js, try to get CF context from various sources
  let cf;
  
  // Method 1: Direct access (should work in Cloudflare environment)
  cf = (request as any).cf;
  
  // Method 2: Try to get from the environment
  if (!cf && typeof process !== 'undefined' && (process as any).env?.cf) {
    cf = (process as any).env.cf;
  }
  
  // Method 3: Try to get from global context
  if (!cf && typeof globalThis !== 'undefined') {
    const cloudflareContext = (globalThis as any).cloudflare || (globalThis as any).CF;
    if (cloudflareContext?.request?.cf) {
      cf = cloudflareContext.request.cf;
    }
  }
  
  // Extract CF data with fallbacks
  const asn = cf?.asn || "UNK";
  const country = cf?.country || "UNK";
  const city = cf?.city || "UNK";
  const colo = cf?.colo || "UNK";

  return NextResponse.json({
    msg: "pong",
    asn,
    country,
    city,
    colo
  });
}
