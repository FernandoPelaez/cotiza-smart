import { NextResponse } from "next/server";
import { z } from "zod";
import { checkOrigin, readJson, errorResponse } from "@/lib/services/http";
import { respondPublic, publicTokenSchema } from "@/lib/services/public-quotes";
import { rateLimit } from "@/lib/services/rate-limit";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    checkOrigin(request);
    const token = publicTokenSchema.parse((await params).token);
    const { action } = z
      .object({ action: z.enum(["accepted", "rejected"]) })
      .parse(await readJson(request));
    await rateLimit(request, "public-respond", 10);
    return NextResponse.json(await respondPublic(token, action));
  } catch (e) {
    return errorResponse(e);
  }
}
