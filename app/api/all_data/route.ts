import { NextRequest, NextResponse } from 'next/server';



export async function GET(request: NextRequest) {
  try {
    // Get the D1 database from the environment
    const env = (globalThis as any).env || 
                (globalThis as any).__env__ || 
                (process as any).env;
    const db = env?.DB;

    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    // Query all data from D1 database
    const result = await db.prepare(
      'SELECT * FROM rum_data ORDER BY timestamp DESC LIMIT 100'
    ).all();

    return NextResponse.json(result.results || []);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
