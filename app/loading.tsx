import { Skeleton } from "@/components/ui/skeleton";
export default function Loading() {
  return (
    <main className="container-main py-16">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-12 w-80 max-w-full mt-5" />
      <div className="mt-12 space-y-6">
        {[1, 2, 3].map((n) => (
          <Skeleton key={n} className="h-14 w-full" />
        ))}
      </div>
    </main>
  );
}
