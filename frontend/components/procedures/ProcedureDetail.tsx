'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ProcedureHeader } from './ProcedureHeader'
import { ProcedureTimeline } from './ProcedureTimeline'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'
import { ShareDialog } from './ShareDialog'
import {
  updateProcedureClient,
  deleteProcedureClient,
  generatePublicSlugClient,
  togglePublicStatusClient,
} from '@/lib/procedures/mutations.client'
import { getErrorMessage } from '@/lib/procedures/errors'
import type { ProcedureWithSteps } from '@/types/database'

interface ProcedureDetailProps {
  procedure: ProcedureWithSteps
}

export function ProcedureDetail({ procedure }: ProcedureDetailProps) {
  const router = useRouter()
  const [currentProcedure, setCurrentProcedure] = useState(procedure)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpdate = useCallback(
    async (updates: { title?: string; description?: string | null }) => {
      setError(null)
      setIsUpdating(true)

      try {
        const updated = await updateProcedureClient(procedure.id, updates)
        setCurrentProcedure((prev) => ({ ...prev, ...updated }))
        router.refresh()
      } catch (err) {
        const message = getErrorMessage(err, 'update')
        setError(message)
        throw err
      } finally {
        setIsUpdating(false)
      }
    },
    [procedure.id, router]
  )

  const handleDelete = useCallback(async () => {
    setError(null)
    setIsDeleting(true)

    try {
      await deleteProcedureClient(procedure.id)
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      const message = getErrorMessage(err, 'delete')
      setError(message)
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }, [procedure.id, router])

  const handleGenerateSlug = useCallback(async () => {
    setError(null)

    try {
      const result = await generatePublicSlugClient(procedure.id)
      setCurrentProcedure((prev) => ({
        ...prev,
        is_public: result.is_public,
        public_slug: result.public_slug,
      }))
      router.refresh()
      return result.public_slug
    } catch (err) {
      const message = getErrorMessage(err, 'save')
      setError(message)
      throw err
    }
  }, [procedure.id, router])

  const handleTogglePublic = useCallback(
    async (isPublic: boolean) => {
      setError(null)

      try {
        await togglePublicStatusClient(procedure.id, isPublic)
        setCurrentProcedure((prev) => ({
          ...prev,
          is_public: isPublic,
          public_slug: isPublic ? prev.public_slug : null,
        }))
        router.refresh()
      } catch (err) {
        const message = getErrorMessage(err, 'update')
        setError(message)
        throw err
      }
    },
    [procedure.id, router]
  )

  return (
    <div className="space-y-8">
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <ProcedureHeader
        procedure={currentProcedure}
        onUpdate={handleUpdate}
        onDelete={() => setShowDeleteDialog(true)}
        onShare={() => setShowShareDialog(true)}
        isUpdating={isUpdating}
      />

      <div className="h-px bg-gray-200" />

      <ProcedureTimeline steps={procedure.steps} />

      {/* Delete dialog */}
      {showDeleteDialog && (
        <DeleteConfirmDialog
          title={currentProcedure.title}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteDialog(false)}
          isDeleting={isDeleting}
        />
      )}

      {/* Share dialog */}
      {showShareDialog && (
        <ShareDialog
          procedure={currentProcedure}
          onClose={() => setShowShareDialog(false)}
          onGenerateSlug={handleGenerateSlug}
          onTogglePublic={handleTogglePublic}
        />
      )}
    </div>
  )
}
