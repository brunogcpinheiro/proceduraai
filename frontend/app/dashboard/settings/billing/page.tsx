import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { Check, Zap } from "lucide-react";
import { redirect } from "next/navigation";

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch real user data
  const { data: profile } = await supabase
    .from("users")
    .select("plan, credits_remaining")
    .eq("id", user.id)
    .single();

  const isPro = profile?.plan === "pro";
  const isBusiness = profile?.plan === "business";
  const credits = profile?.credits_remaining || 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          Assinatura e Créditos
        </h3>
        <p className="text-sm text-gray-500">
          Gerencie seu plano e visualize o consumo de créditos
        </p>
      </div>

      <div className="h-px bg-gray-100" />

      {/* Credit Status Card */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Zap className="h-48 w-48 -mr-12 -mt-12" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                Créditos Disponíveis
              </p>
              <h2 className="text-4xl font-bold mt-1 flex items-baseline gap-2">
                {credits}
                <span className="text-lg text-gray-500 font-normal">
                  créditos
                </span>
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-medium">
              <span
                className={`w-2 h-2 rounded-full ${
                  credits > 10 ? "bg-green-400" : "bg-yellow-400"
                }`}
              ></span>
              {credits > 0 ? "Ativo" : "Esgotado"}
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full md:w-auto">
            <Button variant="secondary" className="w-full">
              Comprar Créditos
            </Button>
            <p className="text-xs text-gray-400 text-center">
              Renova em 01/02/2026
            </p>
          </div>
        </div>
      </div>

      {/* Plan Details */}
      <div className="pt-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">
          Plano Atual
        </h4>
        <div className="border border-green-200 bg-green-50 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 capitalize">
                {profile?.plan || "Free"} Plan
              </p>
              <p className="text-sm text-green-700">Ativo e operante</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="border-green-200 text-green-700 hover:bg-green-100 bg-white"
          >
            Gerenciar
          </Button>
        </div>
      </div>

      {/* Features List (Static for now) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
          <h5 className="font-medium text-gray-900 mb-2">
            Incluído no seu plano
          </h5>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Geração de SOPs Ilimitada (dentro dos créditos)
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Exportação PDF HD
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
