import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    // Read the db.json file
    const dbPath = path.join(process.cwd(), 'data', 'db.json');
    const dbContent = await fs.readFile(dbPath, 'utf8');
    const db = JSON.parse(dbContent);
    
    const token = db.data.settings?.facebook?.accessToken;
    if (!token) {
      return NextResponse.json({ valid: false, error: 'No token configured' }, { status: 400 });
    }

    // Test the token with a simple call to /me
    const response = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${token}`);
    const data = await response.json();

    if (response.ok && data.id) {
      return NextResponse.json({ valid: true, user: data });
    } else {
      return NextResponse.json({ valid: false, error: data.error?.message || 'Invalid token' }, { status: 400 });
    }
  } catch (error) {
    console.error('[Facebook Validate Token] Error reading db.json or calling API:', error);
    return NextResponse.json({ valid: false, error: 'Server error' }, { status: 500 });
  }
}