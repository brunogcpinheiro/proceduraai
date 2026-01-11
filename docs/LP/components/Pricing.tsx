import React from 'react';
import { ScrollReveal } from './ScrollReveal';
import { Button } from './Button';
import { CheckCircle } from './Icons';

export const Pricing: React.FC = () => {
  return (
    <section id="precos" className="py-32 bg-zinc-50 border-t border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
             <ScrollReveal width="w-full">
                <h2 className="text-4xl font-display text-zinc-900 mb-4">Planos Simples</h2>
                <p className="text-zinc-500 text-lg">Comece grátis. Upgrade quando precisar.</p>
             </ScrollReveal>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <ScrollReveal delay={0} className="h-full">
                <div className="h-full p-8 rounded-2xl border border-zinc-200 bg-white flex flex-col hover:shadow-lg transition-shadow">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-zinc-900">Gratuito</h3>
                        <div className="mt-4 flex items-baseline">
                            <span className="text-4xl font-display text-zinc-900">R$ 0</span>
                            <span className="ml-1 text-zinc-500">/mês</span>
                        </div>
                        <p className="mt-2 text-sm text-zinc-500">Para testar e pequenos usos.</p>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-center text-sm text-zinc-600">
                            <CheckCircle className="w-4 h-4 mr-3 text-zinc-400" /> 3 Procedimentos/mês
                        </li>
                        <li className="flex items-center text-sm text-zinc-600">
                            <CheckCircle className="w-4 h-4 mr-3 text-zinc-400" /> Exportação PDF
                        </li>
                        <li className="flex items-center text-sm text-zinc-600">
                            <CheckCircle className="w-4 h-4 mr-3 text-zinc-400" /> 1 Usuário
                        </li>
                    </ul>
                    <Button variant="outline" fullWidth>Começar Agora</Button>
                </div>
            </ScrollReveal>

            {/* Starter */}
            <ScrollReveal delay={150} className="h-full transform lg:-translate-y-4">
                <div className="h-full p-8 rounded-2xl border border-zinc-900 bg-black flex flex-col relative shadow-2xl">
                     <div className="absolute top-0 right-0 -mt-4 mr-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full border border-orange-400 shadow-sm shadow-orange-900/20">
                        MAIS POPULAR
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-white">Starter</h3>
                        <div className="mt-4 flex items-baseline">
                            <span className="text-4xl font-display text-white">R$ 49</span>
                            <span className="ml-1 text-zinc-400">/mês</span>
                        </div>
                        <p className="mt-2 text-sm text-zinc-400">Para profissionais produtivos.</p>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-center text-sm text-zinc-300">
                            <CheckCircle className="w-4 h-4 mr-3 text-white" /> 20 Procedimentos/mês
                        </li>
                        <li className="flex items-center text-sm text-zinc-300">
                            <CheckCircle className="w-4 h-4 mr-3 text-white" /> Sem marca d'água
                        </li>
                        <li className="flex items-center text-sm text-zinc-300">
                            <CheckCircle className="w-4 h-4 mr-3 text-white" /> Link público compartilhável
                        </li>
                         <li className="flex items-center text-sm text-zinc-300">
                            <CheckCircle className="w-4 h-4 mr-3 text-white" /> Edição avançada
                        </li>
                    </ul>
                    <Button variant="primary" fullWidth className="bg-white text-black hover:bg-zinc-200 border-none">Assinar Starter</Button>
                </div>
            </ScrollReveal>

            {/* Pro */}
            <ScrollReveal delay={300} className="h-full">
                <div className="h-full p-8 rounded-2xl border border-zinc-200 bg-white flex flex-col hover:shadow-lg transition-shadow">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-zinc-900">Pro</h3>
                        <div className="mt-4 flex items-baseline">
                            <span className="text-4xl font-display text-zinc-900">R$ 149</span>
                            <span className="ml-1 text-zinc-500">/mês</span>
                        </div>
                        <p className="mt-2 text-sm text-zinc-500">Para times em crescimento.</p>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-center text-sm text-zinc-600">
                            <CheckCircle className="w-4 h-4 mr-3 text-zinc-400" /> 100 Procedimentos/mês
                        </li>
                        <li className="flex items-center text-sm text-zinc-600">
                            <CheckCircle className="w-4 h-4 mr-3 text-zinc-400" /> Exportação Notion/Docs
                        </li>
                        <li className="flex items-center text-sm text-zinc-600">
                            <CheckCircle className="w-4 h-4 mr-3 text-zinc-400" /> 5 Usuários
                        </li>
                        <li className="flex items-center text-sm text-zinc-600">
                            <CheckCircle className="w-4 h-4 mr-3 text-zinc-400" /> Analytics de views
                        </li>
                    </ul>
                    <Button variant="outline" fullWidth>Assinar Pro</Button>
                </div>
            </ScrollReveal>
        </div>
        
        <div className="text-center mt-12">
            <p className="text-zinc-500 text-sm">Aceitamos PIX, Cartão de Crédito e Boleto. Garantia de 7 dias.</p>
        </div>
      </div>
    </section>
  );
};