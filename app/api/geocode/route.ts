import { NextRequest, NextResponse } from "next/server";

interface OWMGeoResult {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OpenWeatherMap API key not configured." }, { status: 500 });
  }

  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=5&appid=${apiKey}`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) {
    return NextResponse.json({ error: "Geocoding request failed." }, { status: res.status });
  }

  const data: OWMGeoResult[] = await res.json();
  const results = data.map((r) => ({
    name: r.name,
    state: r.state,
    country: r.country,
    label: [r.name, r.state, r.country].filter(Boolean).join(", "),
  }));

  return NextResponse.json({ results });
}
