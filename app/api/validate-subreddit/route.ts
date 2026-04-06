import { NextRequest, NextResponse } from "next/server";
import { checkSubredditExists } from "@/lib/reddit";

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");
  if (!name) {
    return NextResponse.json({ error: "Missing name parameter." }, { status: 400 });
  }

  const result = await checkSubredditExists(name);
  return NextResponse.json(result);
}
