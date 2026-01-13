"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createClient } from "@/lib/supabase/client";
import type { User } from "@/types/database";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProfileFormProps {
  user: Pick<User, "name" | "email">;
  userId: string;
}

export function ProfileForm({ user, userId }: ProfileFormProps) {
  const supabase = createClient();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(user.name || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await (supabase.from("users") as any)
        .update({ name })
        .eq("id", userId);

      if (error) throw error;

      router.refresh();
      alert("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Erro ao atualizar perfil.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <div className="space-y-2">
        <Label htmlFor="name">Nome Completo</Label>
        <Input
          id="name"
          placeholder="Seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          disabled
          value={user.email}
          className="bg-gray-50"
        />
        <p className="text-xs text-gray-500">
          O email não pode ser alterado no momento.
        </p>
      </div>

      <div className="flex justify-start pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar Alterações
        </Button>
      </div>
    </form>
  );
}
