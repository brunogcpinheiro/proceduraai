import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("name, email")
    .eq("id", user.id)
    .single();

  if (!profile) {
    // Should not happen if auth is valid, but handle gracefully
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Perfil</h3>
        <p className="text-sm text-gray-500">
          Atualize suas informações pessoais
        </p>
      </div>

      <div className="h-px bg-gray-100" />

      <ProfileForm user={profile as { name: string | null; email: string }} />
    </div>
  );
}
