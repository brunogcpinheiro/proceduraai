import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BrandingForm } from "./BrandingForm";

export default async function BrandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("users")
    .select("brand_color, brand_logo_url, brand_name")
    .eq("id", user.id)
    .single();

  const profile = data as any;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Identidade Visual</h3>
        <p className="text-sm text-gray-500">
          Personalize a aparência dos seus documentos SOP
        </p>
      </div>

      <div className="h-px bg-gray-100" />

      <BrandingForm
        userId={user.id}
        initialColor={profile?.brand_color || "#2563eb"}
        initialLogoUrl={profile?.brand_logo_url || null}
        initialBrandName={profile?.brand_name || null}
      />
    </div>
  );
}
