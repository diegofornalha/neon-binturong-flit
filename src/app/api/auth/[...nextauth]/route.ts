import { NextResponse } from 'next/server'

// This file is a placeholder to resolve a build error related to NextAuth.
// The project uses Supabase Auth, so this route is not actively used.

export async function GET() {
  return NextResponse.json({ message: 'Authentication is handled by Supabase.' })
}

export async function POST() {
  return NextResponse.json({ message: 'Authentication is handled by Supabase.' })
}