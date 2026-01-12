'use client'

import { ArrowLeft, Chrome, Video, FileText, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NewProcedurePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para lista
      </Link>

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
          <Video className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Criar Novo SOP</h1>
        <p className="text-gray-600 max-w-md mx-auto">
          Para criar um novo procedimento, use a extensão ProceduraAI no Chrome.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Como funciona</h2>

        <div className="space-y-4">
          {/* Step 1 */}
          <div className="flex gap-4 p-4 rounded-lg border border-gray-200 bg-white">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
              1
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-gray-900">Instale a extensão</h3>
              <p className="text-sm text-gray-600">
                Baixe e instale a extensão ProceduraAI no Chrome Web Store.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4 p-4 rounded-lg border border-gray-200 bg-white">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
              2
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-gray-900">Inicie a gravação</h3>
              <p className="text-sm text-gray-600">
                Clique no ícone da extensão e depois em &quot;Iniciar Gravação&quot;.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4 p-4 rounded-lg border border-gray-200 bg-white">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
              3
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-gray-900">Execute o procedimento</h3>
              <p className="text-sm text-gray-600">
                Realize as ações que deseja documentar. Cada clique será capturado automaticamente.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-4 p-4 rounded-lg border border-gray-200 bg-white">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
              4
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-gray-900">Finalize e salve</h3>
              <p className="text-sm text-gray-600">
                Clique em &quot;Parar Gravação&quot; para salvar. O SOP aparecerá aqui automaticamente.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <Button asChild variant="outline">
          <Link
            href="https://chrome.google.com/webstore"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2"
          >
            <Chrome className="h-4 w-4" />
            Instalar Extensão
          </Link>
        </Button>
        <Button asChild>
          <Link href="/dashboard" className="inline-flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Ver Meus SOPs
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
