import { sql } from '@/app/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { apiError, badRequest } from '@/app/lib/api-error';
import { resolveFootnoteText } from '@/app/lib/footnotes';
import { parseSongId } from '@/app/lib/validation';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const id = parseSongId(request.nextUrl.searchParams.get('id'));
    if (id === null) {
      return badRequest('A numeric song id is required');
    }

    const songResult = await sql`SELECT id, song FROM songs WHERE id = ${id}`;
    if (!songResult.rowCount) {
      return NextResponse.json({ message: 'Song not found' }, { status: 404 });
    }

    const occurrencesResult = await sql`
      WITH plays AS (
        SELECT
          sl.show_id,
          sl.position,
          sl.set_name,
          sl.minutes,
          sl.seconds,
          sl.footnote_refs,
          s.date AS show_date,
          s.venue AS show_venue,
          s.city AS show_city,
          s.state AS show_state,
          s.notes AS show_notes,
          LAG(s.date) OVER (ORDER BY s.date, sl.position) AS prev_date
        FROM setlists sl
        JOIN shows s ON sl.show_id = s.id
        WHERE sl.song_id = ${id}
      ),
      with_gap AS (
        SELECT
          p.*,
          CASE
            WHEN p.prev_date IS NULL THEN NULL
            WHEN p.prev_date = p.show_date THEN 0
            ELSE (
              SELECT COUNT(*)::int FROM shows
              WHERE date > p.prev_date AND date < p.show_date
            )
          END AS show_gap,
          CASE p.set_name
            WHEN 'Set I' THEN 1
            WHEN 'Set II' THEN 2
            WHEN 'Set III' THEN 3
            WHEN 'Set IV' THEN 4
            ELSE NULL
          END AS set_number
        FROM plays p
      )
      SELECT
        wg.show_id,
        wg.show_date,
        wg.show_venue,
        wg.show_city,
        wg.show_state,
        wg.position,
        wg.set_name,
        wg.set_number,
        wg.minutes,
        wg.seconds,
        wg.footnote_refs,
        wg.show_notes,
        wg.show_gap,
        CASE
          WHEN prev.song_id IS NULL THEN NULL
          WHEN prev.set_name IS DISTINCT FROM wg.set_name THEN NULL
          ELSE prev.song_id
        END AS song_before_id,
        CASE
          WHEN prev.song_id IS NULL THEN NULL
          WHEN prev.set_name IS DISTINCT FROM wg.set_name THEN NULL
          ELSE prev.song_name
        END AS song_before_name,
        CASE
          WHEN nxt.song_id IS NULL THEN NULL
          WHEN nxt.set_name IS DISTINCT FROM wg.set_name THEN NULL
          ELSE nxt.song_id
        END AS song_after_id,
        CASE
          WHEN nxt.song_id IS NULL THEN NULL
          WHEN nxt.set_name IS DISTINCT FROM wg.set_name THEN NULL
          ELSE nxt.song_name
        END AS song_after_name
      FROM with_gap wg
      LEFT JOIN setlists prev ON prev.show_id = wg.show_id AND prev.position = wg.position - 1
      LEFT JOIN setlists nxt ON nxt.show_id = wg.show_id AND nxt.position = wg.position + 1
      ORDER BY wg.show_date DESC, wg.position DESC
    `;

    const occurrences = occurrencesResult.rows.map((row) => {
      const { show_notes, ...occurrence } = row;
      return {
        ...occurrence,
        footnote_text: resolveFootnoteText(row.footnote_refs, show_notes),
      };
    });

    return NextResponse.json(
      {
        song: songResult.rows[0],
        occurrences,
      },
      { status: 200 },
    );
  } catch (error) {
    return apiError(error);
  }
}
