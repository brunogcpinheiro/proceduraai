import React from 'react';
import { ScrollReveal } from './ScrollReveal';
import { Globe, Layers, Share2, Shield, Zap, Monitor } from './Icons';

export const Features: React.FC = () => {
  const features = [
    {
      icon: <Globe className="w-6 h-6" />,
      title: "IA em Português Nativo",
      desc: "Textos gerados como um brasileiro escreve. Nada de traduções estranhas."
    },
    {
      icon: <Layers className="w-6 h-6" />,
      title: "Capturas Automáticas",
      desc: "Screenshots de cada passo com anotações visuais (setas, destaques) automáticas."
    },
    {
      icon: <Share2 className="w-6 h-6" />,
      title: "Exportação Flexível",
      desc: "PDF, Notion, Google Docs ou um link público seguro para compartilhar."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Feito para Times",
      desc: "Workspaces colaborativos, permissões granulares e versionamento."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Pronto em Segundos",
      desc: "O processamento com IA leva menos de 1 minuto para processos complexos."
    },
    {
      icon: <Monitor className="w-6 h-6" />,
      title: "Foco no Navegador",
      desc: "Funciona perfeitamente em qualquer aplicação web acessada pelo Chrome."
    }
  ];

  return (
    <section id="recursos" className="py-24 bg-white border-t border-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal width="w-full" className="mb-16">
            <h2 className="text-3xl font-display text-zinc-900 mb-4">Tudo que você precisa</h2>
            <div className="h-1 w-20 bg-orange-500"></div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
                <ScrollReveal key={idx} delay={idx * 100}>
                    <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-100 hover:border-zinc-300 transition-all duration-300 group">
                        <div className="w-12 h-12 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-900 mb-6 group-hover:bg-orange-500 group-hover:border-orange-500 group-hover:text-white transition-all shadow-sm">
                            {feature.icon}
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 mb-3">{feature.title}</h3>
                        <p className="text-zinc-600 text-sm leading-relaxed">{feature.desc}</p>
                    </div>
                </ScrollReveal>
            ))}
        </div>
      </div>
    </section>
  );
};