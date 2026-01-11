"use client";
import React from 'react';
import { ScrollReveal } from './ScrollReveal';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: "01",
      title: "Clique em Gravar",
      desc: "Ative a extensão do Chrome e prepare-se para realizar a tarefa."
    },
    {
      num: "02",
      title: "Execute o Processo",
      desc: "Faça a tarefa normalmente. A IA captura cada clique e digitação."
    },
    {
      num: "03",
      title: "Receba seu SOP",
      desc: "Em segundos, um guia completo com prints e textos é gerado."
    }
  ];

  return (
    <section id="como-funciona" className="py-32 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal width="w-full" className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-display text-zinc-900 mb-6">Como Funciona</h2>
            <p className="text-zinc-500 max-w-2xl mx-auto text-lg">
                É ridiculamente simples. O sistema observa suas ações e traduz em documentação.
            </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, idx) => (
                <ScrollReveal key={idx} delay={idx * 150} className="h-full">
                    <div className="h-full p-8 border-l border-zinc-200 hover:border-orange-500 transition-colors group">
                        <span className="text-6xl font-display text-zinc-100 group-hover:text-orange-500 transition-colors mb-6 block">
                            {step.num}
                        </span>
                        <h3 className="text-xl font-bold text-zinc-900 mb-4">{step.title}</h3>
                        <p className="text-zinc-600 leading-relaxed">{step.desc}</p>
                    </div>
                </ScrollReveal>
            ))}
        </div>
      </div>
    </section>
  );
};