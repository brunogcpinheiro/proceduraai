import { CreditCard, Palette, User } from "lucide-react";
import Link from "next/link";

const sidebarItems = [
  {
    title: "Perfil",
    href: "/dashboard/settings/profile",
    icon: User,
  },
  {
    title: "Branding",
    href: "/dashboard/settings/branding",
    icon: Palette,
  },
  {
    title: "Assinatura",
    href: "/dashboard/settings/billing",
    icon: CreditCard,
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0 space-y-2">
        <div className="mb-6 px-3">
          <h2 className="text-lg font-semibold text-gray-900">Configurações</h2>
          <p className="text-sm text-gray-500">Gerencie sua conta e equipe</p>
        </div>
        <nav className="space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Content Area */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm p-6 min-h-[500px]">
        {children}
      </div>
    </div>
  );
}
