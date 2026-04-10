import { NextRequest, NextResponse } from "next/server";
import { backendBaseUrl } from "@/lib/backend";

export async function GET() {
  const response = await fetch(`${backendBaseUrl()}/api/posts`, {
    cache: "no-store",
  });

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
