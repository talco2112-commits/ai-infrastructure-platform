import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// KNOWN ISSUE: writes to the local filesystem, which is read-only on Vercel —
// POST will fail in production. Fix planned for Phase 4 (move to DB/storage).
const FILE = path.join(process.cwd(), "src/data/content.json");

export async function GET() {
  try {
    const raw = fs.readFileSync(FILE, "utf-8");
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({});
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    fs.writeFileSync(FILE, JSON.stringify(body, null, 2));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
