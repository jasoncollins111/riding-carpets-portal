import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
 
export async function GET(request: Request) {
  try {
    // const result = await sql`SELECT * from Shows;`;

    await sql`DROP TABLE if exists shows cascade;`;

    const result = await sql`CREATE TABLE Shows (
        id SERIAL PRIMARY KEY,
        date DATE,
        venue varchar(255),
        city varchar(255),
        state varchar(255),
        notes varchar(255)
      );`;
    // console.log('result shows', result)
    return NextResponse.json({  }, { status: 200 });
  } catch (error) {
    console.log('error', error)
    return NextResponse.json({ error }, { status: 500 });
  }
}