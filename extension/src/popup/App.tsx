/**
 * Popup App Component
 * Main entry point for the extension popup UI
 */

import { useRecording } from './hooks/useRecording'
import { RecordingButton } from './components/RecordingButton'
import { RecordingStatus } from './components/RecordingStatus'
import { StepCounter } from './components/StepCounter'
import './styles.css'

export default function App() {
  const {
    isRecording,
    title,
    stepCount,
    isLoading,
    error,
    startRecording,
    stopRecording,
  } = useRecording()

  return (
    <div className="popup-container">
      {/* Header */}
      <header className="popup-header">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">ProceduraAI</h1>
            <p className="text-xs text-gray-500">Documente processos com IA</p>
          </div>
        </div>
        <StepCounter count={stepCount} isRecording={isRecording} />
      </header>

      {/* Main content */}
      <main className="popup-content">
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Recording status */}
        <RecordingStatus
          isRecording={isRecording}
          title={title}
          stepCount={stepCount}
        />

        {/* Recording button */}
        <div className="mt-4">
          <RecordingButton
            isRecording={isRecording}
            isLoading={isLoading}
            onStart={startRecording}
            onStop={stopRecording}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="popup-footer">
        <a
          href="https://procedura.ai/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
        >
          Abrir Dashboard
        </a>
        <span className="text-xs text-gray-400">v1.0.0</span>
      </footer>
    </div>
  )
}
