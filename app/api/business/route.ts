import { authenticatedClient } from "@/lib/services/auth";
import { rateLimit } from "@/lib/services/rate-limit";
import { NextResponse } from "next/server";
import { saveBusiness } from "@/lib/services/workspace";
import { businessSchema } from "@/lib/schemas/quote";
import { checkOrigin, readJson, errorResponse } from "@/lib/services/http";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const { user } = await authenticatedClient();
    await rateLimit(request, "save-business", 30, 60, user.id);
    return NextResponse.json(
      await saveBusiness(businessSchema.parse(await readJson(request))),
    );
  } catch (e) {
    return errorResponse(e);
  }
}
