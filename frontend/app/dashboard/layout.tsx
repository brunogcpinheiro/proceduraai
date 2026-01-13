import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile
  const { data: profile } = (await supabase
    .from("users")
    .select("name, avatar_url, plan, credits_remaining")
    .eq("id", user.id)
    .single()) as {
    data: {
      name?: string;
      avatar_url?: string;
      plan?: string;
      credits_remaining?: number;
    } | null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              ProceduraAI
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Meus SOPs
              </Link>
              <Link
                href="/dashboard/settings"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Configurações
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Credits indicator */}
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-gray-500">Créditos:</span>
              <span className="font-medium text-gray-900">
                {profile?.credits_remaining ?? 0}
              </span>
              {profile?.plan === "free" && (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/pricing">Upgrade</Link>
                </Button>
              )}
            </div>

            {/* User menu */}
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                {profile?.name?.[0]?.toUpperCase() ||
                  user.email?.[0]?.toUpperCase()}
              </div>
              <form action="/api/auth/signout" method="post">
                <Button variant="ghost" size="sm" type="submit">
                  Sair
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
