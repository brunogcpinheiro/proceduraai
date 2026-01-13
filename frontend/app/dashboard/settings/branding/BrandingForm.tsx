"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Upload } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

interface BrandingFormProps {
  userId: string;
  initialColor: string;
  initialLogoUrl: string | null;
  initialBrandName: string | null;
}

export function BrandingForm({
  userId,
  initialColor,
  initialLogoUrl,
  initialBrandName,
}: BrandingFormProps) {
  const supabase = createClient();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [color, setColor] = useState(initialColor || "#2563eb");
  const [brandName, setBrandName] = useState(initialBrandName || "");
  const [logoPreview, setLogoPreview] = useState<string | null>(initialLogoUrl);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create local preview
      const objectUrl = URL.createObjectURL(file);
      setLogoPreview(objectUrl);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let finalLogoUrl = initialLogoUrl;

      // 1. Upload Logo if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${userId}/logo-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("branding")
          .upload(fileName, selectedFile, {
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("branding").getPublicUrl(fileName);

        finalLogoUrl = publicUrl;
      }

      // 2. Update User Profile
      // Cast query builder to any to bypass strict type check issue where Update is inferred as never
      const { error: updateError } = await (supabase.from("users") as any)
        .update({
          brand_color: color,
          brand_logo_url: finalLogoUrl,
          brand_name: brandName,
        })
        .eq("id", userId);

      if (updateError) throw updateError;

      alert("Configurações salvas com sucesso!"); // Simple feedback for now
      router.refresh();
    } catch (error) {
      console.error("Error saving branding:", error);
      alert("Erro ao salvar configurações.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-xl">
      {/* Brand Name Section */}
      <div className="space-y-4">
        <Label htmlFor="brandName">Nome da Empresa</Label>
        <Input
          id="brandName"
          placeholder="Ex: Acme Corp"
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
        />
        <p className="text-xs text-gray-500">
          Aparecerá junto ao logo no cabeçalho dos documentos.
        </p>
      </div>

      {/* Logo Section */}
      <div className="space-y-4">
        <Label>Logo da Empresa</Label>
        <div className="flex items-start gap-6">
          <div className="relative h-24 w-24 rounded-lg bg-gray-50 border border-dashed border-gray-300 flex items-center justify-center shrink-0 overflow-hidden">
            {logoPreview ? (
              <Image
                src={logoPreview}
                alt="Logo Preview"
                fill
                className="object-contain p-2"
              />
            ) : (
              <span className="text-xs text-gray-400 text-center px-1">
                Seu Logo
              </span>
            )}
          </div>
          <div className="space-y-2">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/png, image/jpeg"
              onChange={handleFileChange}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Carregar Imagem
            </Button>
            <p className="text-xs text-gray-500">
              JPG ou PNG. Max 2MB. Recomendado 400x400px.
            </p>
          </div>
        </div>
      </div>

      {/* Color Section */}
      <div className="space-y-4">
        <Label htmlFor="color">Cor Primária</Label>
        <div className="flex items-center gap-4">
          <div
            className="h-10 w-10 rounded-lg border border-gray-200 shadow-sm transition-colors"
            style={{ backgroundColor: color }}
          />
          <div className="flex-1">
            <Input
              id="color"
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="#000000"
              className="font-mono"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Esta cor será usada em destaques (balões de passo) nos documentos.
        </p>
      </div>

      <div className="flex justify-start pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar Preferências
        </Button>
      </div>
    </form>
  );
}
