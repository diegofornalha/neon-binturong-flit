import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/database"

export async function GET() {
  try {
    const db = await getDb()
    const ai = (db.data.settings as any)?.ai || null
    return NextResponse.json({ success: true, data: ai })
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { provider, apiKey } = await request.json()

    if (!apiKey) {
      return NextResponse.json({ success: false, error: "API Key é obrigatória" }, { status: 400 })
    }

    const db = await getDb()
    if (!db.data.settings) db.data.settings = {}
    ;(db.data.settings as any).ai = {
      provider: provider || "openai",
      apiKey,
      updatedAt: new Date().toISOString()
    }
    await db.write()

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 })
  }
}