import { NextResponse } from "next/server";
import { syncOfficialNews, OFFICIAL_ALGERIAN_SOURCES } from "@/lib/services/news-ingestion";

function isAuthorized(req: Request): boolean {
  const cronSecret = process.env.CRON_SECRET || process.env.WEBHOOK_SECRET;
  if (!cronSecret) return true;

  const { searchParams } = new URL(req.url);
  const token =
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    searchParams.get("key") ||
    searchParams.get("secret");

  return token === cronSecret;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncOfficialNews();
  return NextResponse.json({
    success: result.success,
    syncedCount: result.syncedCount,
    sourcesCount: OFFICIAL_ALGERIAN_SOURCES.length,
    items: result.items.slice(0, 10),
    error: result.error,
  });
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncOfficialNews();
  return NextResponse.json({
    success: result.success,
    syncedCount: result.syncedCount,
    sourcesCount: OFFICIAL_ALGERIAN_SOURCES.length,
    items: result.items,
    error: result.error,
  });
}
