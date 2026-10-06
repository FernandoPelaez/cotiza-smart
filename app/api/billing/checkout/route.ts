import { NextResponse } from "next/server";
import { z } from "zod";
import { checkout } from "@/lib/services/billing";
import { authenticatedClient } from "@/lib/services/auth";
import { checkOrigin, readJson, errorResponse } from "@/lib/services/http";
import { rateLimit } from "@/lib/services/rate-limit";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const { user } = await authenticatedClient();
    await rateLimit(request, "checkout", 6, 60, user.id);
    const { plan } = z
      .object({ plan: z.enum(["pro", "premium"]) })
      .parse(await readJson(request));
    return NextResponse.json(await checkout(request, plan));
  } catch (e) {
    return errorResponse(e);
  }
}
