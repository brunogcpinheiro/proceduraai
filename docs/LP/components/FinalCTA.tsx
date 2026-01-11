import React from 'react';
import { ScrollReveal } from './ScrollReveal';
import { Parallax } from './Parallax';
import { Button } from './Button';

export const FinalCTA: React.FC = () => {
  return (
    <section className="py-32 bg-zinc-50 relative overflow-hidden border-t border-zinc-200">
        {/* Abstract shapes with Parallax */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
             <Parallax speed={0.3} className="absolute top-0 right-0 w-full h-full">
                <div className="absolute top-0 right-0 w-96 h-96 bg-zinc-200 rounded-full blur-[150px] opacity-40"></div>
             </Parallax>
             <Parallax speed={0.15} className="absolute bottom-0 left-0 w-full h-full">
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-zinc-300 rounded-full blur-[150px] opacity-30"></div>
             </Parallax>
        </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <ScrollReveal width="w-full">
            <h2 className="text-4xl md:text-5xl font-display text-zinc-900 mb-6">
                Pronto para parar de perder tempo com documentação?
            </h2>
            <p className="text-xl text-zinc-500 mb-10">
                Junte-se a +500 empresas que já automatizaram seus processos.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Button size="lg" className="min-w-[200px] shadow-xl">Criar Conta Grátis</Button>
            </div>
            <p className="mt-6 text-sm text-zinc-500 font-medium">
                Setup em 2 minutos • Sem cartão de crédito
            </p>
        </ScrollReveal>
      </div>
    </section>
  );
};