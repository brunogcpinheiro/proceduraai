import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-zinc-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <a href="#" className="text-2xl font-bold font-display text-zinc-900 mb-4 block">
              Procedura<span className="text-orange-600">AI</span>
            </a>
            <p className="text-zinc-500 max-w-sm mb-6">
              A maneira mais inteligente de documentar processos. Economize tempo e escale seu time sem o caos.
            </p>
          </div>
          
          <div>
            <h4 className="text-zinc-900 font-bold mb-4">Produto</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-zinc-500 hover:text-black transition-colors">Download Extensão</a></li>
              <li><a href="#" className="text-zinc-500 hover:text-black transition-colors">Preços</a></li>
              <li><a href="#" className="text-zinc-500 hover:text-black transition-colors">Login</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-zinc-900 font-bold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-zinc-500 hover:text-black transition-colors">Privacidade</a></li>
              <li><a href="#" className="text-zinc-500 hover:text-black transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="text-zinc-500 hover:text-black transition-colors">Contato</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-zinc-100 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-zinc-400 text-sm mb-4 md:mb-0">
                &copy; {new Date().getFullYear()} ProceduraAI. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6">
                {/* Social icons could go here */}
            </div>
        </div>
      </div>
    </footer>
  );
};