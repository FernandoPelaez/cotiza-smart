import { NextResponse } from "next/server";
import { getWorkspace } from "@/lib/services/workspace";
import { errorResponse } from "@/lib/services/http";
export async function GET() {
  try {
    return NextResponse.json(await getWorkspace(), {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
