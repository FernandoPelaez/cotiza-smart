import { NextResponse } from "next/server";
import { portal } from "@/lib/services/billing";
import { authenticatedClient } from "@/lib/services/auth";
import { checkOrigin, errorResponse } from "@/lib/services/http";
import { rateLimit } from "@/lib/services/rate-limit";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const { user } = await authenticatedClient();
    await rateLimit(request, "billing-portal", 10, 60, user.id);
    return NextResponse.json(await portal(request));
  } catch (e) {
    return errorResponse(e);
  }
}
