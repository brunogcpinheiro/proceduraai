'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { Pencil, Check, X, Loader2, Plus } from 'lucide-react'

interface EditableDescriptionProps {
  value: string | null
  onSave: (value: string | null) => Promise<void>
  isLoading?: boolean
  placeholder?: string
}

export function EditableDescription({
  value,
  onSave,
  isLoading = false,
  placeholder = 'Adicionar descrição...',
}: EditableDescriptionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value ?? '')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.select()
      adjustHeight()
    }
  }, [isEditing])

  useEffect(() => {
    setEditValue(value ?? '')
  }, [value])

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  const handleSave = async () => {
    const trimmed = editValue.trim()
    const newValue = trimmed || null

    if (newValue === value) {
      setIsEditing(false)
      return
    }

    try {
      await onSave(newValue)
      setIsEditing(false)
    } catch {
      setEditValue(value ?? '')
    }
  }

  const handleCancel = () => {
    setEditValue(value ?? '')
    setIsEditing(false)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <div className="space-y-2">
        <textarea
          ref={textareaRef}
          value={editValue}
          onChange={(e) => {
            setEditValue(e.target.value)
            adjustHeight()
          }}
          onKeyDown={handleKeyDown}
          className="w-full text-gray-600 border-b-2 border-primary bg-transparent focus:outline-none resize-none overflow-hidden"
          placeholder={placeholder}
          disabled={isLoading}
          rows={1}
          aria-label="Editar descrição"
        />
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
          ) : (
            <>
              <button
                onClick={handleSave}
                className="px-2 py-1 rounded text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Salvar
              </button>
              <button
                onClick={handleCancel}
                className="px-2 py-1 rounded text-xs font-medium text-gray-500 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <span className="text-xs text-gray-400">
                Ctrl+Enter para salvar
              </span>
            </>
          )}
        </div>
      </div>
    )
  }

  if (!value) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <Plus className="h-4 w-4" />
        <span className="text-sm">{placeholder}</span>
      </button>
    )
  }

  return (
    <div className="group flex items-start gap-2">
      <p className="text-gray-600 max-w-2xl">{value}</p>
      <button
        onClick={() => setIsEditing(true)}
        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-100 text-gray-400 transition-opacity shrink-0"
        aria-label="Editar descrição"
      >
        <Pencil className="h-4 w-4" />
      </button>
    </div>
  )
}
