import React from 'react';
import { ScrollReveal } from './ScrollReveal';
import { Clock, Camera, FileText } from './Icons';

export const ProblemSolution: React.FC = () => {
  const problems = [
    { icon: <Camera />, text: "Dezenas de capturas de tela manuais" },
    { icon: <FileText />, text: "Escrever e formatar descrições chatas" },
    { icon: <Clock />, text: "Horas perdidas toda semana" },
  ];

  return (
    <section className="py-24 bg-zinc-50 border-t border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          
          {/* The Problem */}
          <div>
            <ScrollReveal>
                <h2 className="text-3xl md:text-4xl font-display mb-6 text-zinc-900">Criar SOPs não deveria consumir seu dia inteiro</h2>
                <p className="text-zinc-600 text-lg mb-8 leading-relaxed">
                    Você já perdeu a tarde toda documentando um processo simples? Quando um funcionário sai, o conhecimento vai embora junto.
                </p>
            </ScrollReveal>

            <div className="space-y-6">
                {problems.map((item, idx) => (
                    <ScrollReveal key={idx} delay={idx * 100}>
                        <div className="flex items-center p-4 rounded-lg bg-white border border-zinc-200 shadow-sm">
                            <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-md text-zinc-900 mr-4">
                                {item.icon}
                            </div>
                            <span className="text-zinc-700 font-medium">{item.text}</span>
                        </div>
                    </ScrollReveal>
                ))}
            </div>
          </div>

          {/* The Solution Stats */}
          <div className="relative">
             <ScrollReveal delay={200}>
                <div className="p-8 md:p-12 rounded-2xl bg-white border border-zinc-200 shadow-xl shadow-zinc-200/40 relative overflow-hidden">
                    
                    <h3 className="text-2xl font-bold text-zinc-900 mb-8 font-display">A Diferença Procedura<span className="text-orange-500">AI</span></h3>
                    
                    <div className="space-y-8">
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-zinc-500 font-medium">Tempo Gasto (Manual)</span>
                                <span className="text-zinc-400 line-through decoration-zinc-400">120 min</span>
                            </div>
                            <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                                <div className="h-full bg-zinc-300 w-full"></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-zinc-900 font-bold">Com ProceduraAI</span>
                                <span className="text-orange-600 font-bold">5 min</span>
                            </div>
                            <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                                <div className="h-full bg-orange-500 w-[4%]"></div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 p-4 bg-zinc-50 rounded-lg border border-zinc-100 text-center">
                         <p className="text-sm text-zinc-600 italic">
                             "Literalmente mudou como nossa agência funciona."
                         </p>
                         <p className="text-xs text-zinc-400 mt-2 font-bold">— Maria S., Diretora de Operações</p>
                    </div>
                </div>
             </ScrollReveal>
          </div>

        </div>
      </div>
    </section>
  );
};