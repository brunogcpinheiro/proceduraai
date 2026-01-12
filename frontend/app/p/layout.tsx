import Link from 'next/link'

interface PublicLayoutProps {
  children: React.ReactNode
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl text-gray-900">
            ProceduraAI
          </Link>
          <Link
            href="/login"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Fazer login
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="max-w-5xl mx-auto px-4 py-8 text-center text-sm text-gray-500">
          <p>
            Criado com{' '}
            <Link href="/" className="text-primary hover:underline">
              ProceduraAI
            </Link>{' '}
            - Documente processos automaticamente
          </p>
        </div>
      </footer>
    </div>
  )
}
