import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteQuote } from "@/lib/services/workspace";
import { checkOrigin, errorResponse } from "@/lib/services/http";
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    checkOrigin(request);
    const { id } = await params;
    await deleteQuote(z.string().uuid().parse(id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
