import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
 
export async function GET(request: Request) {
  try {
    // await sql`DROP TABLE setlists cascade;`;
    
    const result =
      await sql`CREATE TABLE setlists (
        show_id INTEGER REFERENCES shows(id), 
        song_id INTEGER REFERENCES songs(id),
        song_name VARCHAR(255),
        CONSTRAINT setlists_pk PRIMARY KEY(show_id, song_id));`;
    console.log('setlist create table...', result)  
    // return NextResponse.json({ result }, { status: 200 });
    return NextResponse.json({ }, { status: 200 });
  } catch (error) {
    console.log('error', error);
    return NextResponse.json({ error }, { status: 500 });
  }
}