'use client'

import { useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ProcedureCard } from './ProcedureCard'
import { Pagination } from './Pagination'
import { SearchInput } from './SearchInput'
import { EmptyState } from './EmptyState'
import type { ProcedureListItem } from '@/types/database'

interface ProcedureListProps {
  procedures: ProcedureListItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  search?: string
}

export function ProcedureList({
  procedures,
  total,
  page,
  pageSize,
  totalPages,
  search = '',
}: ProcedureListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateSearchParams = useCallback(
    (updates: { page?: number; search?: string }) => {
      const params = new URLSearchParams(searchParams.toString())

      if (updates.page !== undefined) {
        if (updates.page === 1) {
          params.delete('page')
        } else {
          params.set('page', updates.page.toString())
        }
      }

      if (updates.search !== undefined) {
        if (!updates.search) {
          params.delete('search')
        } else {
          params.set('search', updates.search)
        }
        // Reset to page 1 when search changes
        params.delete('page')
      }

      const queryString = params.toString()
      router.push(queryString ? `?${queryString}` : '/', { scroll: false })
    },
    [router, searchParams]
  )

  const handlePageChange = useCallback(
    (newPage: number) => {
      updateSearchParams({ page: newPage })
    },
    [updateSearchParams]
  )

  const handleSearchChange = useCallback(
    (newSearch: string) => {
      updateSearchParams({ search: newSearch })
    },
    [updateSearchParams]
  )

  const hasSearch = search.length > 0
  const isEmpty = procedures.length === 0

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="max-w-md">
        <SearchInput value={search} onChange={handleSearchChange} />
      </div>

      {/* Results info */}
      {!isEmpty && (
        <p className="text-sm text-gray-500">
          {total === 1
            ? '1 procedimento encontrado'
            : `${total} procedimentos encontrados`}
          {hasSearch && ` para "${search}"`}
        </p>
      )}

      {/* Empty state */}
      {isEmpty ? (
        hasSearch ? (
          <EmptyState
            title="Nenhum resultado encontrado"
            description={`Não encontramos procedimentos com "${search}". Tente outro termo de busca.`}
            showAction={false}
          />
        ) : (
          <EmptyState />
        )
      ) : (
        <>
          {/* Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {procedures.map((procedure) => (
              <ProcedureCard key={procedure.id} procedure={procedure} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
