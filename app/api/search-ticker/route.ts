import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 1) {
    return NextResponse.json({ results: [] });
  }

  const apiKey = process.env.finnhub_api_key;
  if (!apiKey) {
    return NextResponse.json({ error: "Finnhub API key not configured." }, { status: 500 });
  }

  const url = `https://finnhub.io/api/v1/search?q=${encodeURIComponent(q)}&token=${apiKey}`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) {
    return NextResponse.json({ error: "Finnhub request failed." }, { status: res.status });
  }

  const data = await res.json();
  // Filter to equity/ETF types and limit results
  const results = (data.result ?? [])
    .filter((r: { type: string }) => ["Common Stock", "ETP", "ETF"].includes(r.type))
    .slice(0, 8)
    .map((r: { symbol: string; description: string }) => ({
      symbol: r.symbol,
      description: r.description,
    }));

  return NextResponse.json({ results });
}
