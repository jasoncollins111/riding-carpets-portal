import { sql } from '@vercel/postgres';
import { NextResponse, NextRequest } from 'next/server';
 
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id")
  // const { id } = body;

  try {
    
    const response = await sql`SELECT * FROM setlists WHERE show_id = ${id};`;
    console.log('response......', response)
    
    return NextResponse.json({ response  }, { status: 200 });
  } catch (error) {
    console.log('error', error);
    return NextResponse.json({ error }, { status: 500 });
  }
}