import { NextRequest, NextResponse } from "next/server";

const PARSER_URL = process.env.SCHEDULE_PARSER_URL ?? "http://localhost:3001";

export async function POST(req: NextRequest) {
  try {
    const body = await req.formData();

    // Forward the file to the schedule-parser service
    const res = await fetch(`${PARSER_URL}/parse`, {
      method: "POST",
      body,
    });

    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Give a clear signal when the parser service is not running
    if (msg.includes("ECONNREFUSED") || msg.includes("fetch failed")) {
      return NextResponse.json(
        { error: "Schedule parser service is not running. Start it with: cd schedule-parser && node server.js" },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
