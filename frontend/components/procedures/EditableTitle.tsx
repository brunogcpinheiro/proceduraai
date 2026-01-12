'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { Pencil, Check, X, Loader2 } from 'lucide-react'

interface EditableTitleProps {
  value: string
  onSave: (value: string) => Promise<void>
  isLoading?: boolean
}

export function EditableTitle({
  value,
  onSave,
  isLoading = false,
}: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  useEffect(() => {
    setEditValue(value)
  }, [value])

  const handleSave = async () => {
    const trimmed = editValue.trim()
    if (!trimmed || trimmed === value) {
      setEditValue(value)
      setIsEditing(false)
      return
    }

    try {
      await onSave(trimmed)
      setIsEditing(false)
    } catch {
      setEditValue(value)
    }
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="text-2xl font-bold text-gray-900 border-b-2 border-primary bg-transparent focus:outline-none w-full"
          disabled={isLoading}
          aria-label="Editar título"
        />
        {isLoading ? (
          <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
        ) : (
          <>
            <button
              onClick={handleSave}
              className="p-1 rounded hover:bg-gray-100 text-green-600"
              aria-label="Salvar título"
            >
              <Check className="h-5 w-5" />
            </button>
            <button
              onClick={handleCancel}
              className="p-1 rounded hover:bg-gray-100 text-gray-500"
              aria-label="Cancelar edição"
            >
              <X className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="group flex items-center gap-2">
      <h1 className="text-2xl font-bold text-gray-900">{value}</h1>
      <button
        onClick={() => setIsEditing(true)}
        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-100 text-gray-400 transition-opacity"
        aria-label="Editar título"
      >
        <Pencil className="h-4 w-4" />
      </button>
    </div>
  )
}
