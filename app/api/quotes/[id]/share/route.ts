import { NextResponse } from "next/server";
import { z } from "zod";
import { shareQuote } from "@/lib/services/workspace";
import { checkOrigin, errorResponse } from "@/lib/services/http";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    checkOrigin(request);
    return NextResponse.json(
      await shareQuote(
        z
          .string()
          .uuid()
          .parse((await params).id),
      ),
    );
  } catch (e) {
    return errorResponse(e);
  }
}
