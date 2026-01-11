"use client";
import React from "react";
import { Button } from "./Button";
import { ArrowRight, CheckCircle } from "./Icons";
import { ScrollReveal } from "./ScrollReveal";

import { FloatingPaths } from "@/components/ui/background-paths";

export const Hero: React.FC = () => {
  return (
    <section className="relative pt-20 pb-20 md:pt-32 md:pb-32 overflow-hidden bg-white">
      {/* Background Floating Paths */}
      {/* Background Floating Paths */}
      <div className="absolute -top-[20%] inset-x-0 h-[140%] overflow-hidden pointer-events-none z-0">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="flex flex-col items-center">
          <ScrollReveal>
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-zinc-200 bg-white shadow-sm mb-8">
              <span className="flex h-2 w-2 rounded-full bg-orange-500 mr-2 animate-pulse"></span>
              <span className="text-xs font-semibold text-zinc-900 tracking-wide uppercase">
                V 1.0 Já disponível
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100} width="w-full">
            <h1 className="text-5xl md:text-7xl font-heading text-zinc-900 mb-6 leading-[1.1] tracking-tight">
              Transforme 2 horas de
              <br className="hidden md:block" /> trabalho em{" "}
              <span className="text-orange-600 underline decoration-orange-200 decoration-4 underline-offset-4">
                5 minutos
              </span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={200} width="w-full max-w-2xl">
            <p className="text-xl text-zinc-500 mb-10 leading-relaxed font-light">
              Grave qualquer processo no seu navegador e deixe a IA criar
              documentação profissional automaticamente.
              <span className="hidden sm:inline">
                {" "}
                Sem esforço. Sem capturas manuais.
              </span>
            </p>
          </ScrollReveal>

          <ScrollReveal delay={300} width="w-full">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="group min-w-[200px]">
                Começar Grátis{" "}
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" className="min-w-[200px]">
                Ver Demonstração
              </Button>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={400}>
            <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-zinc-500 font-medium">
              <span className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-zinc-900" /> Sem
                cartão de crédito
              </span>
              <span className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-zinc-900" /> +500
                empresas
              </span>
              <span className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-zinc-900" /> 4.9/5
                avaliação
              </span>
            </div>
          </ScrollReveal>
        </div>

        {/* Dashboard Preview Mockup (CSS Pure) */}
        <ScrollReveal delay={600} width="w-full">
          <div className="mt-24 relative mx-auto max-w-5xl">
            {/* Decoration behind dashboard */}
            <div className="absolute -inset-1 bg-gradient-to-b from-orange-100/50 to-white rounded-2xl blur opacity-30"></div>

            <div className="relative rounded-xl border border-zinc-200 bg-white shadow-2xl overflow-hidden">
              {/* Browser Toolbar */}
              <div className="h-10 bg-zinc-50 border-b border-zinc-100 flex items-center px-4 space-x-2">
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-zinc-200"></div>
                  <div className="w-3 h-3 rounded-full bg-zinc-200"></div>
                  <div className="w-3 h-3 rounded-full bg-zinc-200"></div>
                </div>
                <div className="flex-1 px-4">
                  <div className="h-6 bg-white border border-zinc-100 rounded-md w-full max-w-sm mx-auto flex items-center justify-center text-[10px] text-zinc-400">
                    procedura.ai/dashboard
                  </div>
                </div>
              </div>

              {/* App Interface */}
              <div className="flex h-[400px] md:h-[500px] text-left">
                {/* Sidebar */}
                <div className="w-16 md:w-64 border-r border-zinc-100 bg-zinc-50/50 p-4 hidden md:flex flex-col gap-4">
                  <div className="h-8 w-8 rounded-lg bg-orange-600 mb-4 flex items-center justify-center text-white font-bold text-xs">
                    P
                  </div>
                  <div className="space-y-2">
                    <div className="h-8 w-full bg-orange-50 border-l-2 border-orange-500 rounded-r-md flex items-center px-3">
                      <div className="w-20 h-2 bg-orange-200 rounded-full"></div>
                    </div>
                    <div className="h-8 w-full bg-transparent rounded-md border border-dashed border-zinc-200 flex items-center px-3">
                      <div className="w-16 h-2 bg-zinc-200 rounded-full"></div>
                    </div>
                    <div className="h-8 w-3/4 bg-transparent rounded-md border border-dashed border-zinc-200 flex items-center px-3">
                      <div className="w-12 h-2 bg-zinc-200 rounded-full"></div>
                    </div>
                  </div>
                  <div className="mt-auto space-y-2">
                    <div className="h-8 w-full bg-zinc-100 rounded-md"></div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 bg-white p-6 md:p-8 overflow-hidden relative">
                  {/* App Header */}
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <div className="h-6 w-32 bg-zinc-100 rounded mb-2"></div>
                      <div className="h-4 w-48 bg-zinc-50 rounded"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 w-8 rounded-full bg-zinc-100"></div>
                      <div className="h-8 w-8 rounded-full bg-zinc-900"></div>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl border border-zinc-100 bg-white shadow-sm"
                      >
                        <div className="h-4 w-8 bg-zinc-100 rounded mb-2"></div>
                        <div className="h-8 w-16 bg-zinc-900 rounded opacity-10"></div>
                      </div>
                    ))}
                  </div>

                  {/* List Header */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="h-5 w-24 bg-zinc-100 rounded"></div>
                    <div className="h-8 w-24 bg-black rounded-lg"></div>
                  </div>

                  {/* List Items */}
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 rounded-lg border border-zinc-100 hover:border-orange-200 transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-zinc-50 group-hover:bg-orange-50 transition-colors flex items-center justify-center text-zinc-300 group-hover:text-orange-300">
                            <div className="w-5 h-5 bg-current rounded"></div>
                          </div>
                          <div>
                            <div className="h-4 w-32 bg-zinc-100 rounded mb-1.5 group-hover:bg-zinc-200 transition-colors"></div>
                            <div className="h-3 w-20 bg-zinc-50 rounded"></div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="h-6 w-16 rounded-full bg-zinc-50 border border-zinc-100"></div>
                          <div className="h-4 w-4 bg-zinc-100 rounded-full"></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Fade out at bottom */}
                  <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
