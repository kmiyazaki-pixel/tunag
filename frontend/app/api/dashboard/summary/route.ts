import { NextResponse } from "next/server";

function backendBaseUrl(): string {
  const hostport = process.env.BACKEND_HOSTPORT;
  if (!hostport) throw new Error("BACKEND_HOSTPORT is not defined");
  if (hostport.startsWith("http")) return hostport;
  return `https://${hostport}`;
}

export async function GET() {
  const response = await fetch(`${backendBaseUrl()}/api/dashboard/summary`, { cache: "no-store" });
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
