/**
 * Recording Button Component
 * Main button to start/stop recording
 */

import { useState } from 'react'

interface RecordingButtonProps {
  isRecording: boolean
  isLoading: boolean
  onStart: (title: string) => Promise<void>
  onStop: () => Promise<unknown>
}

export function RecordingButton({
  isRecording,
  isLoading,
  onStart,
  onStop,
}: RecordingButtonProps) {
  const [showTitleInput, setShowTitleInput] = useState(false)
  const [title, setTitle] = useState('')

  const handleStartClick = () => {
    if (showTitleInput) {
      const procedureTitle = title.trim() || 'Novo Procedimento'
      onStart(procedureTitle)
      setShowTitleInput(false)
      setTitle('')
    } else {
      setShowTitleInput(true)
    }
  }

  const handleStopClick = () => {
    onStop()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleStartClick()
    } else if (e.key === 'Escape') {
      setShowTitleInput(false)
      setTitle('')
    }
  }

  if (isRecording) {
    return (
      <button
        onClick={handleStopClick}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-medium rounded-xl transition-colors"
      >
        {isLoading ? (
          <span className="animate-pulse">Parando...</span>
        ) : (
          <>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            Parar Gravação
          </>
        )}
      </button>
    )
  }

  if (showTitleInput) {
    return (
      <div className="space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nome do procedimento..."
          autoFocus
          className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowTitleInput(false)
              setTitle('')
            }}
            className="flex-1 py-2 px-4 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleStartClick}
            disabled={isLoading}
            className="flex-1 py-2 px-4 text-sm bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium rounded-lg transition-colors"
          >
            {isLoading ? 'Iniciando...' : 'Iniciar'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={handleStartClick}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium rounded-xl transition-colors"
    >
      {isLoading ? (
        <span className="animate-pulse">Carregando...</span>
      ) : (
        <>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <circle cx="12" cy="12" r="4" fill="currentColor" />
          </svg>
          Iniciar Gravação
        </>
      )}
    </button>
  )
}
