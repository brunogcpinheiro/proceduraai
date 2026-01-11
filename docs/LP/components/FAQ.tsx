import React, { useState } from 'react';
import { ScrollReveal } from './ScrollReveal';
import { Play } from './Icons';

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-zinc-200">
      <button 
        className="w-full py-6 flex items-center justify-between text-left focus:outline-none group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-bold text-zinc-900 group-hover:text-zinc-600 transition-colors">{question}</span>
        <Play 
            className={`w-4 h-4 text-zinc-400 transform transition-transform duration-300 ${isOpen ? 'rotate-90' : 'rotate-0'}`} 
            fill="currentColor"
        />
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 opacity-100 pb-6' : 'max-h-0 opacity-0'}`}
      >
        <p className="text-zinc-600 leading-relaxed pr-8">
            {answer}
        </p>
      </div>
    </div>
  );
};

export const FAQ: React.FC = () => {
  const faqs = [
    {
      question: "Funciona em qualquer site?",
      answer: "Sim! A extensão funciona em qualquer site ou aplicação web que você acesse pelo navegador Google Chrome."
    },
    {
      question: "Precisa instalar algo no computador?",
      answer: "Apenas a extensão do Chrome. Leva menos de 30 segundos para instalar e configurar."
    },
    {
      question: "Os dados são seguros?",
      answer: "Absolutamente. Usamos criptografia de ponta a ponta e seguimos as melhores práticas de segurança. Seus dados de procedimentos privados nunca são compartilhados."
    },
    {
      question: "Posso cancelar a qualquer momento?",
      answer: "Sim, sem multas ou taxas ocultas. Você mantém o acesso aos seus recursos até o final do ciclo de cobrança vigente."
    }
  ];

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal width="w-full" className="text-center mb-16">
            <h2 className="text-3xl font-display text-zinc-900 mb-4">Perguntas Frequentes</h2>
        </ScrollReveal>

        <div className="space-y-2">
            {faqs.map((faq, idx) => (
                <ScrollReveal key={idx} delay={idx * 50} width="w-full">
                    <FAQItem question={faq.question} answer={faq.answer} />
                </ScrollReveal>
            ))}
        </div>
      </div>
    </section>
  );
};