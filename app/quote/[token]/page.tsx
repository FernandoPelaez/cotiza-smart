import { notFound } from "next/navigation";
import { getPublicQuote } from "@/lib/services/public-quotes";
import { ServiceError } from "@/lib/services/http";
import { PublicQuote } from "@/components/quotes/PublicQuote";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Cotización",
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  let data;
  try {
    data = await getPublicQuote(token);
  } catch (e) {
    if (e instanceof ServiceError && e.status === 404) notFound();
    throw e;
  }
  return (
    <PublicQuote initial={data.quote} business={data.business} token={token} />
  );
}
