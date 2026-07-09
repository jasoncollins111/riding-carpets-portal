import { NextRequest, NextResponse } from 'next/server';
import { apiError, badRequest } from '@/app/lib/api-error';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.IMPORT_SECRET;
    if (!secret) {
      return badRequest('Import is not configured');
    }

    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const scriptPath = path.join(process.cwd(), 'src/scripts/import-sheets.js');
    const { stdout, stderr } = await execAsync(`node "${scriptPath}"`, {
      timeout: 120000,
      env: process.env,
    });

    return NextResponse.json({ message: 'Import complete', stdout, stderr }, { status: 200 });
  } catch (error) {
    return apiError(error);
  }
}
