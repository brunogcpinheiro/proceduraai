export function ProcedureDetailSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="space-y-4">
        {/* Back link */}
        <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />

        {/* Title */}
        <div className="space-y-3">
          <div className="h-8 w-2/3 bg-gray-100 rounded animate-pulse" />
          <div className="h-5 w-1/2 bg-gray-100 rounded animate-pulse" />
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-4">
          <div className="h-6 w-20 bg-gray-100 rounded-full animate-pulse" />
          <div className="h-5 w-24 bg-gray-100 rounded animate-pulse" />
          <div className="h-5 w-20 bg-gray-100 rounded animate-pulse" />
          <div className="h-5 w-28 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200" />

      {/* Timeline skeleton */}
      <div className="space-y-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <StepCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

function StepCardSkeleton() {
  return (
    <div className="flex gap-4">
      {/* Screenshot skeleton */}
      <div className="shrink-0 w-64 md:w-[280px]">
        <div className="aspect-video bg-gray-100 rounded-lg animate-pulse" />
      </div>

      {/* Content skeleton */}
      <div className="flex-1 py-1 space-y-3">
        {/* Action badge */}
        <div className="h-6 w-20 bg-gray-100 rounded-full animate-pulse" />

        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
        </div>

        {/* Page info */}
        <div className="h-3 w-40 bg-gray-100 rounded animate-pulse" />
      </div>
    </div>
  )
}
