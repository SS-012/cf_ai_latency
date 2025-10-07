

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get the D1 database from the environment
    // Try different ways to access the environment
    const env = (globalThis as any).env || 
                (globalThis as any).__env__ || 
                (process as any).env;
    const db = env?.DB;

    if (!db) {
      console.error('Database not found in environment:', Object.keys(env || {}));
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    // Insert data into D1 database
    await db.prepare(
      `INSERT INTO rum_data (colo, timestamp, avg_rtt, jitter, asn, country, city)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        body.colo,
        body.timestamp,
        body.avg_rtt,
        body.jitter,
        body.asn,
        body.country,
        body.city
      )
      .run();

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to save data' },
      { status: 500 }
    );
  }
}
