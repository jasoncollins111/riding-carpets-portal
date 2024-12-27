import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
 
export async function POST(request: Request) {
  const body = await request.json();
  const { setlist, date, venue } = body;

  let song_id;
  let show_id;
  setlist.map(async (songData: any) => {
    const song_name = songData.song_name;
    try {
      const songResult = await sql`SELECT id FROM songs WHERE song = ${song_name}`;
      const showResult = await sql`SELECT id FROM shows WHERE date = ${date} AND venue = ${venue}`; 
      if (songResult.rowCount === 0) throw new Error('Song not found');
      if (showResult.rowCount === 0) throw new Error('Show not found');
      
      song_id = songResult.rows[0].id;
      show_id = showResult.rows[0].id;
      if (!show_id || !song_id) throw new Error('data required');
      await sql`INSERT INTO setlists (show_id, song_id, song_name) VALUES (${show_id}, ${song_id}, ${song_name});`;
    } catch (error) {
      console.log('error', error)
      return NextResponse.json({ error }, { status: 500 });
    }
  })
 
  const shows = await sql`SELECT * FROM Shows;`;
  return NextResponse.json({ shows }, { status: 200 });
}