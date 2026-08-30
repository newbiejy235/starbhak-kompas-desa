import { Skeleton } from "@/components/ui/Skeleton";

const cardCls = "rounded-2xl border border-gray-200/80 bg-white";

export default function ProfileSkeleton() {
  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className={cardCls}>
          <div className="h-36 sm:h-44 bg-gradient-to-br from-primary to-primary-dark" />
          <div className="px-6 pb-6 -mt-14 text-center">
            <Skeleton className="mx-auto h-28 w-28 rounded-full ring-4 ring-white" />
            <div className="mt-4 space-y-2 flex flex-col items-center">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-28" />
              <div className="flex gap-2 mt-1">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`${cardCls} p-6 space-y-4`}>
                <Skeleton className="h-5 w-40" />
                <div className="space-y-3">
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3.5 w-4/5" />
                  <Skeleton className="h-3.5 w-full" />
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-6">
            <div className={`${cardCls} p-6 space-y-4`}>
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-3.5 w-2/3" />
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-1/2" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
