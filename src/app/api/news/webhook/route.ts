import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveCampaign } from "@/lib/data/public";
import { classifyNewsItem } from "@/config/news-sources";

/**
 * Webhook endpoint to receive real-time posts from Facebook Pages (e.g. DGPC0018)
 * Triggered by Make.com, Pipedream, Zapier, or a Python script.
 */
export async function POST(req: Request) {
  const secret = process.env.WEBHOOK_SECRET || process.env.CRON_SECRET;
  const { searchParams } = new URL(req.url);
  const token =
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    searchParams.get("secret") ||
    searchParams.get("key");

  if (secret && token !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, text, message, url, source = "مديرية الحماية المدنية لولاية جيجل" } = body;

    const postText = message || text || title || "";
    if (!postText.trim()) {
      return NextResponse.json({ error: "Missing text content" }, { status: 400 });
    }

    const { update_type, is_urgent } = classifyNewsItem(postText);
    const campaign = await getActiveCampaign();
    const supabase = await createClient();

    // Extract title (first line) and body (rest)
    const lines = postText.split("\n").filter((l: string) => l.trim().length > 0);
    const postTitle = lines[0]?.slice(0, 200) || "بيان من الحماية المدنية - جيجل";
    const postBody = lines.slice(1).join("\n") || postText;

    if (!campaign) {
      return NextResponse.json({ error: "Active campaign not found" }, { status: 404 });
    }

    const { data, error } = await supabase.from("official_updates").insert({
      campaign_id: campaign.id,
      title: postTitle,
      body: postBody,
      source: source,
      url: url || "https://www.facebook.com/DGPC0018",
      update_type: update_type,
      published_at: new Date().toISOString(),
    }).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Post ingested successfully from DGPC0018",
      item: data,
      is_urgent,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
