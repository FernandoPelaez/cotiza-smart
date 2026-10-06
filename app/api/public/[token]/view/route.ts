import { NextResponse } from "next/server";
import { checkOrigin, errorResponse } from "@/lib/services/http";
import { recordView, publicTokenSchema } from "@/lib/services/public-quotes";
import { rateLimit } from "@/lib/services/rate-limit";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    checkOrigin(request);
    const token = publicTokenSchema.parse((await params).token);
    await rateLimit(request, "public-view", 60);
    await recordView(token);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
