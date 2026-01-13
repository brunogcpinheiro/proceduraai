"use client";

import type { ActionType, Step } from "@/types/database";
import {
  ArrowUpDown,
  ExternalLink,
  Globe,
  Keyboard,
  List,
  MousePointer,
  Navigation,
  Tag,
  Type,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface StepCardProps {
  step: Step;
  onScreenshotClick?: () => void;
}

const actionConfig: Record<
  ActionType,
  { label: string; icon: typeof MousePointer; color: string }
> = {
  click: {
    label: "Clique",
    icon: MousePointer,
    color: "text-blue-600 bg-blue-50",
  },
  input: {
    label: "Digitação",
    icon: Type,
    color: "text-purple-600 bg-purple-50",
  },
  navigate: {
    label: "Navegação",
    icon: Navigation,
    color: "text-green-600 bg-green-50",
  },
  scroll: {
    label: "Rolagem",
    icon: ArrowUpDown,
    color: "text-orange-600 bg-orange-50",
  },
  select: { label: "Seleção", icon: List, color: "text-pink-600 bg-pink-50" },
};

const tagLabels: Record<string, string> = {
  button: "Botão",
  a: "Link",
  input: "Campo de texto",
  textarea: "Área de texto",
  select: "Menu de seleção",
  checkbox: "Caixa de seleção",
  radio: "Opção",
  label: "Rótulo",
  div: "Área",
  span: "Texto",
  img: "Imagem",
  form: "Formulário",
  li: "Item de lista",
  ul: "Lista",
  nav: "Navegação",
  header: "Cabeçalho",
  footer: "Rodapé",
  section: "Seção",
  article: "Artigo",
  aside: "Barra lateral",
  main: "Conteúdo principal",
  h1: "Título principal",
  h2: "Subtítulo",
  h3: "Subtítulo",
  p: "Parágrafo",
  table: "Tabela",
  tr: "Linha da tabela",
  td: "Célula",
  th: "Cabeçalho de coluna",
  video: "Vídeo",
  audio: "Áudio",
  svg: "Ícone",
};

function getSimplifiedUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname + urlObj.search;
  } catch {
    return url;
  }
}

function getTagLabel(tag: string | null): string | null {
  if (!tag) return null;
  const lowerTag = tag.toLowerCase();
  return tagLabels[lowerTag] || tag.toUpperCase();
}

export function StepCard({ step, onScreenshotClick }: StepCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const action = actionConfig[step.action_type];
  const ActionIcon = action.icon;

  const screenshotUrl = step.annotated_screenshot_url ?? step.screenshot_url;
  const description = step.manual_text ?? step.generated_text;
  const tagLabel = getTagLabel(step.element_tag);
  const simplifiedUrl = step.page_url ? getSimplifiedUrl(step.page_url) : null;
  const inputValue = (step as Step & { input_value?: string }).input_value;

  return (
    <div className="flex gap-4 relative">
      {/* Timeline connector */}
      <div className="absolute left-[140px] top-0 bottom-0 w-px bg-gray-200 hidden md:block" />

      {/* Screenshot */}
      <div className="shrink-0 w-64 md:w-[280px]">
        <button
          onClick={onScreenshotClick}
          className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer group"
          aria-label="Ver screenshot em tamanho real"
        >
          {/* Blur placeholder */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse" />
          )}

          {screenshotUrl ? (
            <Image
              src={screenshotUrl}
              alt={`Passo ${step.order_index + 1}`}
              fill
              className={`object-cover transition-opacity duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              sizes="280px"
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAj/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAB//2Q=="
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <span className="text-gray-400 text-sm">Sem screenshot</span>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <ExternalLink className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
          </div>
        </button>
      </div>

      {/* Step number indicator (on timeline) */}
      <div className="hidden md:flex absolute left-[132px] top-4 w-4 h-4 rounded-full bg-primary text-primary-foreground text-xs items-center justify-center font-medium z-10">
        {step.order_index + 1}
      </div>

      {/* Content */}
      <div className="flex-1 py-1">
        {/* Step header */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="md:hidden inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
            {step.order_index + 1}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${action.color}`}
          >
            <ActionIcon className="h-3 w-3" />
            {action.label}
          </span>
          {tagLabel && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-gray-600 bg-gray-100">
              <Tag className="h-3 w-3" />
              {tagLabel}
            </span>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-gray-700 leading-relaxed">{description}</p>
        )}

        {/* Element info */}
        {step.element_text && (
          <p className="mt-2 text-sm text-gray-500">
            Elemento:{" "}
            <code
              className="bg-gray-100 px-1.5 py-0.5 rounded text-xs max-w-xs inline-block truncate align-bottom"
              title={step.element_text}
            >
              {step.element_text.length > 50
                ? `${step.element_text.slice(0, 50)}...`
                : step.element_text}
            </code>
          </p>
        )}

        {/* Input value (for input actions) */}
        {inputValue && (
          <p className="mt-2 text-sm text-gray-500 flex items-center gap-1.5">
            <Keyboard className="h-3.5 w-3.5" />
            Digitou:{" "}
            <code className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded text-xs">
              {inputValue}
            </code>
          </p>
        )}

        {/* Simplified URL */}
        {simplifiedUrl && (
          <p
            className="mt-2 text-xs text-gray-400 flex items-center gap-1.5 truncate"
            title={step.page_url}
          >
            <Globe className="h-3 w-3 shrink-0" />
            <span className="truncate">{simplifiedUrl}</span>
          </p>
        )}
      </div>
    </div>
  );
}
