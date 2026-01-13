"use client";

import { Eye, FileDown, FileText } from "lucide-react";
import Link from "next/link";

interface PublicSOPHeaderProps {
  viewsCount: number;
}

export function PublicSOPHeader({ viewsCount }: PublicSOPHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 print:hidden">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary">
          <FileText className="h-6 w-6" />
          <span className="font-semibold">ProceduraAI</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Eye className="h-4 w-4" />
            <span>{viewsCount} visualizações</span>
          </div>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
          >
            <FileDown className="h-4 w-4" />
            <span className="hidden sm:inline">PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
}
