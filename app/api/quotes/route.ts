import { authenticatedClient } from "@/lib/services/auth";
import { rateLimit } from "@/lib/services/rate-limit";
import { NextResponse } from "next/server";
import { z } from "zod";
import { saveQuote } from "@/lib/services/workspace";
import { quoteSchema } from "@/lib/schemas/quote";
import { checkOrigin, readJson, errorResponse } from "@/lib/services/http";
const schema = z.object({
  input: quoteSchema,
  id: z.string().uuid().optional(),
  revision: z.number().int().positive().optional(),
  request_id: z.string().uuid(),
});
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const { user } = await authenticatedClient();
    await rateLimit(request, "save-quote", 90, 60, user.id);
    const { input, id, revision, request_id } = schema.parse(
      await readJson(request),
    );
    return NextResponse.json(await saveQuote(input, id, revision, request_id));
  } catch (e) {
    return errorResponse(e);
  }
}
