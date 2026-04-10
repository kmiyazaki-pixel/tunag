import { NextResponse } from "next/server";
import { backendBaseUrl } from "@/lib/backend";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;

  const response = await fetch(`${backendBaseUrl()}/api/posts/${id}`, {
    cache: "no-store",
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
