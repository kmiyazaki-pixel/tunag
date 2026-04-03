import { NextRequest, NextResponse } from "next/server";

function backendBaseUrl(): string {
  const hostport = process.env.BACKEND_HOSTPORT;
  if (!hostport) throw new Error("BACKEND_HOSTPORT is not defined");
  return `http://${hostport}`;
}

export async function GET() {
  const response = await fetch(`${backendBaseUrl()}/api/posts`, { cache: "no-store" });
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const response = await fetch(`${backendBaseUrl()}/api/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    cache: "no-store",
  });
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
