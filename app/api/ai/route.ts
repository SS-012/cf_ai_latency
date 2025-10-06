import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const colo = searchParams.get('colo');

    if (!colo) {
      return NextResponse.json(
        { error: 'Missing ?colo=XYZ' },
        { status: 400 }
      );
    }

    // Get the D1 database and AI from the environment
    const env = (globalThis as any).env || 
                (globalThis as any).__env__ || 
                (process as any).env;
    const db = env?.DB;
    const ai = env?.AI;

    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    // Fetch data for the specified colo from D1 database
    const result = await db.prepare(
      'SELECT avg_rtt, jitter FROM rum_data WHERE colo = ? ORDER BY timestamp DESC LIMIT 100'
    ).bind(colo).all();

    const coloData = result.results || [];

    if (coloData.length === 0) {
      return NextResponse.json(
        { error: `No data found for colo ${colo}` },
        { status: 404 }
      );
    }

    // Calculate averages
    const avgRtt = coloData.reduce((sum: number, r: any) => sum + parseFloat(r.avg_rtt), 0) / coloData.length;
    const avgJitter = coloData.reduce((sum: number, r: any) => sum + parseFloat(r.jitter), 0) / coloData.length;

    let insights = `Based on ${coloData.length} recent measurements, ${colo} shows ${avgRtt < 50 ? 'excellent' : avgRtt < 100 ? 'good' : 'poor'} latency performance with an average RTT of ${avgRtt.toFixed(2)}ms.`;

    // Try to use AI if available
    if (ai) {
      try {
        const prompt = `
          You are analyzing latency data for Cloudflare PoP ${colo}.
          Recent ${coloData.length} entries show:
          - Average RTT = ${avgRtt.toFixed(2)} ms
          - Average Jitter = ${avgJitter.toFixed(2)} ms
          
          Provide a short human-friendly performance insight (1–2 sentences).
        `;

        const aiRes = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
          messages: [{ role: 'user', content: prompt }]
        });

        insights = aiRes.response;
      } catch (aiError) {
        console.error('AI error:', aiError);
        // Fall back to mock response
      }
    }

    return NextResponse.json({
      colo,
      insights,
      summary: { avgRtt, avgJitter, count: coloData.length }
    });
  } catch (error) {
    console.error('AI insights error:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
