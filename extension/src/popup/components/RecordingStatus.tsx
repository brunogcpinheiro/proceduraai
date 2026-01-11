/**
 * Recording Status Component
 * Displays current recording status and metadata
 */

interface RecordingStatusProps {
  isRecording: boolean
  title: string | null
  stepCount: number
}

export function RecordingStatus({
  isRecording,
  title,
  stepCount,
}: RecordingStatusProps) {
  if (!isRecording) {
    return (
      <div className="text-center py-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p className="text-sm text-gray-500">
          Clique para iniciar uma nova gravação
        </p>
      </div>
    )
  }

  return (
    <div className="bg-red-50 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
        <span className="text-sm font-medium text-red-700">Gravando...</span>
      </div>

      {title && (
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{title}</h3>
      )}

      <div className="flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-1.5">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <span>
            {stepCount} {stepCount === 1 ? 'passo' : 'passos'}
          </span>
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-500">
        Navegue normalmente. Cada clique será registrado.
      </p>
    </div>
  )
}
