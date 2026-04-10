import { NextResponse } from "next/server";
import { backendBaseUrl } from "@/lib/backend";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(_: Request, { params }: Params) {
  const { id } = await params;

  const response = await fetch(`${backendBaseUrl()}/api/posts/${id}/read`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  let data: unknown = null;
  const text = await response.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text };
  }

  return NextResponse.json(data, { status: response.status });
}
