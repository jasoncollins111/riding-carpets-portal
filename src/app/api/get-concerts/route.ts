import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
 
export async function GET(request: Request) {
  try {
    const shows = await sql`SELECT * FROM Shows;`;
    // console.log('result shows', shows)
    return NextResponse.json({ shows }, { status: 200 });
  } catch (error) {
    console.log('error', error)
    return NextResponse.json({ error }, { status: 500 });
  }
}