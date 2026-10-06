import { NextResponse } from "next/server";
import { z } from "zod";
import { markNotificationsRead } from "@/lib/services/notifications";
import { checkOrigin, errorResponse, readJson } from "@/lib/services/http";
import { authenticatedClient } from "@/lib/services/auth";
import { rateLimit } from "@/lib/services/rate-limit";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const { user } = await authenticatedClient();
    await rateLimit(request, "notifications", 60, 60, user.id);
    const { id } = z
      .object({ id: z.string().uuid().optional() })
      .parse(await readJson(request));
    await markNotificationsRead(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
