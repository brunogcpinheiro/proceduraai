export function ProcedureListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Search skeleton */}
      <div className="max-w-md">
        <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
      </div>

      {/* Results info skeleton */}
      <div className="h-5 w-40 bg-gray-100 rounded animate-pulse" />

      {/* Grid skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProcedureCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

function ProcedureCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Thumbnail skeleton */}
      <div className="aspect-video bg-gray-100 animate-pulse" />

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-5 bg-gray-100 rounded w-3/4 animate-pulse" />

        {/* Metadata */}
        <div className="flex items-center gap-4">
          <div className="h-4 bg-gray-100 rounded w-20 animate-pulse" />
          <div className="h-4 bg-gray-100 rounded w-16 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
