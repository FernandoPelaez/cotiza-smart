import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticatedClient } from "@/lib/services/auth";
import { duplicateQuote } from "@/lib/services/workspace";
import { rateLimit } from "@/lib/services/rate-limit";
import { checkOrigin, readJson, errorResponse } from "@/lib/services/http";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    checkOrigin(request);
    const { user } = await authenticatedClient();
    await rateLimit(request, "duplicate-quote", 30, 60, user.id);
    const id = z
      .string()
      .uuid()
      .parse((await params).id);
    const { request_id } = z
      .object({ request_id: z.string().uuid() })
      .parse(await readJson(request));
    return NextResponse.json(await duplicateQuote(id, request_id));
  } catch (error) {
    return errorResponse(error);
  }
}
