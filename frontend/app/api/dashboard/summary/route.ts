import { NextResponse } from "next/server";
import { backendBaseUrl } from "@/lib/backend";

export async function GET() {
  const response = await fetch(`${backendBaseUrl()}/api/dashboard/summary`, {
    cache: "no-store",
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
