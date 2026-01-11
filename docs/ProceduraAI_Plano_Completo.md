# ProceduraAI

## Documentação Automática de Processos com IA

**Plano de Negócios Completo**

Inclui: Análise de Mercado • Estrutura Técnica do MVP • Wireframes • Copy para Landing Page • Estratégia SEO

---

*Janeiro 2026 | Versão 1.0 | Documento Confidencial*

---

## Índice

1. [Sumário Executivo](#1-sumário-executivo)
2. [Análise de Mercado](#2-análise-de-mercado)
3. [Produto e Features](#3-produto-e-features)
4. [Estrutura Técnica do MVP](#4-estrutura-técnica-do-mvp)
5. [Wireframes e Fluxos](#5-wireframes-e-fluxos)
6. [Modelo de Negócio](#6-modelo-de-negócio)
7. [Estratégia Go-to-Market](#7-estratégia-go-to-market)
8. [Copy para Landing Page](#8-copy-para-landing-page)
9. [Estratégia de SEO](#9-estratégia-de-seo)
10. [Projeções Financeiras](#10-projeções-financeiras)
11. [Riscos e Mitigações](#11-riscos-e-mitigações)
12. [Cronograma e Próximos Passos](#12-cronograma-e-próximos-passos)

---

## 1. Sumário Executivo

### O Problema

Empresas em crescimento desperdiçam centenas de horas documentando processos manualmente. Criar um SOP (Procedimento Operacional Padrão) que deveria levar 5 minutos acaba consumindo 2 horas entre capturas de tela, descrições e formatação. Quando um funcionário sai, o conhecimento vai embora junto.

### A Solução

ProceduraAI é uma extensão de navegador que grava a execução de qualquer tarefa e automaticamente gera documentação profissional usando IA. O usuário simplesmente faz a tarefa normalmente enquanto a ferramenta captura tudo e transforma em um SOP completo com capturas de tela anotadas, textos explicativos e exportação para múltiplos formatos.

### Por que Agora?

- Mercado brasileiro de SaaS B2B em crescimento acelerado (CAGR 25%)
- Zero concorrentes diretos em português com IA nativa
- Ferramentas gringas (Scribe, Tango) cobram em dólar - proibitivo para PMEs
- GPT-4 e modelos de IA permitem geração de texto de alta qualidade
- Trabalho remoto aumentou demanda por documentação de processos

### Métricas-Alvo (12 meses)

| Métrica | Meta |
|---------|------|
| MRR | R$ 50.000 |
| Clientes Pagantes | 500+ |
| Churn Mensal | < 5% |
| CAC | < R$ 150 |
| LTV | > R$ 600 |

---

## 2. Análise de Mercado

### Tamanho do Mercado

O mercado global de ferramentas de documentação de processos é estimado em US$ 2.3 bilhões (2024), com crescimento projetado de 18% ao ano. O Brasil representa aproximadamente 3% desse mercado, com potencial de R$ 400 milhões anuais.

### TAM / SAM / SOM

| Mercado | Descrição | Potencial |
|---------|-----------|-----------|
| **TAM** | Total de empresas brasileiras com processos digitais | R$ 400M/ano |
| **SAM** | Agências, startups, consultorias, franquias | R$ 80M/ano |
| **SOM** | Meta realista: 0.5% do SAM em 3 anos | R$ 4.8M ARR |

### Análise Competitiva

| Concorrente | Preço | Idioma | Fraqueza |
|-------------|-------|--------|----------|
| Scribe | $23/usuário/mês | Inglês | Caro, sem PT-BR nativo |
| Tango | $16/usuário/mês | Inglês | Interface confusa |
| Loom | $12.50/usuário/mês | Inglês | Só vídeo, sem SOP |
| StepCapture | $15/usuário/mês | Inglês | Sem IA avançada |
| **ProceduraAI** | R$49-149/mês | **Português** | Novo no mercado |

### Diferenciais Competitivos

- **IA nativa em português:** Textos gerados como brasileiro escreve, não tradução
- **Preço Brasil:** 1/3 do valor dos concorrentes gringos
- **Pagamento em Real via PIX:** Sem fricção de cartão internacional
- **Suporte em português:** Atendimento humanizado no fuso brasileiro
- **Integrações locais:** Notion, Google Workspace, ferramentas populares no BR

---

## 3. Produto e Features

### Como Funciona

O ProceduraAI transforma qualquer tarefa executada no navegador em documentação profissional automaticamente. O fluxo é simples e intuitivo:

| Etapa | Ação do Usuário | O que Acontece |
|-------|-----------------|----------------|
| 1. Iniciar | Clica em 'Gravar' | Extensão começa a capturar eventos |
| 2. Executar | Faz a tarefa normalmente | Sistema grava cliques e telas |
| 3. Parar | Clica em 'Parar Gravação' | Dados são enviados para processamento |
| 4. Processar | Aguarda (~30 segundos) | IA analisa e gera documentação |
| 5. Revisar | Edita se necessário | Ajusta títulos ou descrições |
| 6. Exportar | Escolhe formato | PDF, Notion, Google Docs ou link |

### Features do MVP (Versão 1.0)

- ✓ Extensão Chrome para gravação de tela e cliques
- ✓ Captura automática de eventos (cliques, formulários, navegação)
- ✓ Geração de texto explicativo com GPT-4 em português
- ✓ Anotações visuais automáticas (setas, destaques, círculos)
- ✓ Editor de revisão para ajustes manuais
- ✓ Exportação para PDF
- ✓ Dashboard web para gerenciar procedimentos
- ✓ Compartilhamento via link público
- ✓ Sistema de autenticação e planos

### Features Futuras (Versão 2.0+)

- ○ Exportação para Notion e Google Docs
- ○ Geração de vídeo explicativo automático
- ○ Workspace para times com permissões
- ○ Versionamento de procedimentos
- ○ Analytics de visualizações
- ○ Templates personalizáveis
- ○ Integração com Slack e Microsoft Teams
- ○ API para integrações customizadas

---

## 4. Estrutura Técnica do MVP

### Stack Tecnológico

| Camada | Tecnologia | Justificativa |
|--------|------------|---------------|
| Frontend Web | Next.js 14 + Tailwind CSS | Performance, SEO, familiaridade, ecosystem |
| Extensão Chrome | TypeScript + Manifest V3 | Padrão moderno, seguro, tipagem forte |
| Backend/API | Supabase Edge Functions | Serverless, escalável, integrado |
| Banco de Dados | Supabase PostgreSQL | Relacional, RLS, real-time |
| Storage | Supabase Storage | Integrado, CDN, seguro |
| IA/LLM | OpenAI GPT-4 / Claude API | Melhor qualidade de texto em PT |
| Processamento Imagem | Sharp.js + Canvas API | Anotações e redimensionamento |
| Pagamentos BR | Asaas (PIX/Boleto) | PIX instantâneo, boleto |
| Pagamentos INT | Stripe | Cartões internacionais |
| Hospedagem | Vercel | Deploy automático, edge network |
| Analytics | Mixpanel + Hotjar | Comportamento e UX |

### Arquitetura do Sistema

A arquitetura é dividida em três componentes principais que se comunicam via APIs REST e WebSockets para real-time updates:

| Componente | Responsabilidades | Tecnologias |
|------------|-------------------|-------------|
| **Extensão Chrome** | Captura eventos do navegador (cliques, navegação, forms), tira screenshots, envia dados | TypeScript, Chrome APIs, Manifest V3 |
| **Backend API** | Recebe dados, processa imagens, chama API de IA, armazena resultados, gerencia auth | Supabase Edge Functions, PostgreSQL |
| **Dashboard Web** | Interface para gerenciar, editar, exportar procedimentos, configurações de conta | Next.js 14, React, Tailwind CSS |

### Estrutura de Dados (PostgreSQL)

```sql
-- Usuários (gerenciado pelo Supabase Auth)
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  plan TEXT DEFAULT 'free',
  credits_remaining INT DEFAULT 3,
  created_at TIMESTAMP
)

-- Procedimentos
procedures (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title TEXT,
  description TEXT,
  status TEXT DEFAULT 'processing',
  steps JSONB,
  is_public BOOLEAN DEFAULT false,
  public_slug TEXT UNIQUE,
  views_count INT DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Steps (cada passo do procedimento)
steps (
  id UUID PRIMARY KEY,
  procedure_id UUID REFERENCES procedures(id),
  order_index INT,
  screenshot_url TEXT,
  annotated_screenshot_url TEXT,
  action_type TEXT,
  element_selector TEXT,
  generated_text TEXT,
  manual_text TEXT,
  created_at TIMESTAMP
)

-- Uso de créditos
credit_usage (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  procedure_id UUID REFERENCES procedures(id),
  credits_used INT,
  created_at TIMESTAMP
)
```

### Fluxo de Processamento

1. **Captura (Extensão):** Usuário executa tarefa → extensão captura eventos DOM + screenshots
2. **Upload:** Dados são comprimidos e enviados para Supabase Storage via signed URLs
3. **Trigger:** Edge Function é acionada para processar o procedimento
4. **Análise de Imagem:** Sharp.js redimensiona e otimiza screenshots
5. **Geração de Texto:** GPT-4 recebe contexto (ação + screenshot) e gera descrição
6. **Anotações:** Canvas API adiciona setas, destaques e numeração nas imagens
7. **Montagem:** Sistema monta o documento final com todos os steps
8. **Notificação:** Usuário é notificado (push + email) que procedimento está pronto

### Estrutura de Diretórios

```
procedura-ai/
├── apps/
│   ├── web/                    # Next.js Dashboard
│   │   ├── app/
│   │   │   ├── (auth)/         # Rotas autenticadas
│   │   │   │   ├── dashboard/
│   │   │   │   ├── procedures/
│   │   │   │   └── settings/
│   │   │   ├── (public)/       # Rotas públicas
│   │   │   │   ├── p/[slug]/   # Visualização pública
│   │   │   │   └── pricing/
│   │   │   └── api/
│   │   ├── components/
│   │   └── lib/
│   │
│   └── extension/              # Chrome Extension
│       ├── src/
│       │   ├── background/     # Service Worker
│       │   ├── content/        # Content Scripts
│       │   ├── popup/          # Popup UI
│       │   └── lib/
│       └── manifest.json
│
├── packages/
│   ├── database/               # Supabase types + migrations
│   ├── ai/                     # OpenAI/Claude integrations
│   └── shared/                 # Shared utilities
│
└── supabase/
    ├── functions/              # Edge Functions
    │   ├── process-procedure/
    │   └── generate-export/
    └── migrations/
```

---

## 5. Wireframes e Fluxos

### 5.1 Fluxo da Extensão Chrome

A extensão é o coração do produto. Ela deve ser simples, não-intrusiva e funcionar em qualquer site.

#### Popup da Extensão (Estados)

| Estado | Elementos UI | Ações Disponíveis |
|--------|--------------|-------------------|
| **Idle** (Parado) | Logo + 'Pronto para gravar' + Botão verde 'Iniciar Gravação' + Créditos restantes | Clicar para iniciar gravação |
| **Recording** (Gravando) | Indicador vermelho pulsante + Timer + Contador de passos + Botão 'Parar e Processar' | Clicar para finalizar |
| **Processing** | Spinner + 'Processando com IA...' + Barra de progresso + Estimativa de tempo | Aguardar (30-60s) |
| **Complete** | Checkmark verde + 'Procedimento criado!' + Preview miniatura + Botões: 'Ver' / 'Editar' / 'Compartilhar' | Navegar para dashboard |
| **Error** | Ícone erro + Mensagem específica + Botão 'Tentar Novamente' + Link para suporte | Retry ou contato |

### 5.2 Dashboard Web

| Seção | Funcionalidade | Elementos Principais |
|-------|----------------|---------------------|
| **Sidebar** | Navegação principal | Logo, Menu (Procedures, Templates, Settings), Upgrade CTA, User avatar |
| **Header** | Contexto e ações | Título da página, Botão 'Novo Procedimento', Notificações, Search |
| **Lista de Procedures** | Visualização de todos os SOPs | Cards com thumbnail, título, data, status, views, menu de ações |
| **Editor** | Edição de procedimento | Preview lado a lado, campos editáveis, reordenar steps, anotações |
| **Visualizador Público** | Sharing externo | Layout limpo, steps numerados, navegação, CTA para criar conta |

### 5.3 Fluxo de Onboarding

| Passo | Tela | Objetivo |
|-------|------|----------|
| 1 | Welcome + Value Prop | Mostrar o benefício principal: 'Transforme 2h em 5min' |
| 2 | Instalar Extensão | CTA para Chrome Web Store + instruções visuais |
| 3 | Primeiro Procedimento | Guia interativo: 'Vamos criar seu primeiro SOP juntos' |
| 4 | Sucesso! | Celebração + mostrar resultado + CTA para compartilhar ou criar outro |

### 5.4 Wireframe Detalhado - Popup da Extensão

#### Estado: Idle (Aguardando)

```
┌─────────────────────────────┐
│      🔵 ProceduraAI         │
├─────────────────────────────┤
│                             │
│    Pronto para gravar       │
│                             │
│  ┌───────────────────────┐  │
│  │  ● INICIAR GRAVAÇÃO   │  │
│  └───────────────────────┘  │
│                             │
│    Créditos: 17/20          │
│    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░    │
│                             │
├─────────────────────────────┤
│  ⚙️ Configurações  │  ❓ Ajuda │
└─────────────────────────────┘
```

#### Estado: Recording (Gravando)

```
┌─────────────────────────────┐
│   🔴 GRAVANDO • 02:34       │
├─────────────────────────────┤
│                             │
│      12 passos capturados   │
│                             │
│    [Screenshot preview]     │
│    Último: Clique em        │
│    "Salvar Cadastro"        │
│                             │
│  ┌───────────────────────┐  │
│  │  ⏹️ PARAR E PROCESSAR │  │
│  └───────────────────────┘  │
│                             │
│      ⏸️ Pausar gravação     │
└─────────────────────────────┘
```

#### Estado: Complete (Finalizado)

```
┌─────────────────────────────┐
│      ✅ Procedimento        │
│         Criado!             │
├─────────────────────────────┤
│                             │
│  "Como cadastrar cliente"   │
│      12 passos • 2min       │
│                             │
│  ┌─────────┐ ┌─────────┐   │
│  │   Ver   │ │  Editar │   │
│  └─────────┘ └─────────┘   │
│                             │
│  ┌───────────────────────┐  │
│  │  🔗 Copiar Link       │  │
│  └───────────────────────┘  │
│                             │
│    + Criar novo procedimento│
└─────────────────────────────┘
```

### 5.5 Wireframe - Dashboard Principal

```
┌────────────────────────────────────────────────────────────────────────┐
│  🔵 ProceduraAI          🔍 Buscar...              🔔  👤 Bruno ▼     │
├──────────────┬─────────────────────────────────────────────────────────┤
│              │                                                         │
│  📋 Meus     │   Meus Procedimentos                    + Novo          │
│  Procedim.   │   ─────────────────────────────────────────────        │
│              │                                                         │
│  📁 Pastas   │   ┌─────────────────────────────────────────────────┐  │
│              │   │ 📄 Como cadastrar cliente no CRM                │  │
│  📊 Analytics│   │    12 passos • Criado há 2 dias • 45 views      │  │
│              │   │    [Editar] [Compartilhar] [Duplicar] [...]     │  │
│  ⚙️ Config.  │   └─────────────────────────────────────────────────┘  │
│              │                                                         │
│  ─────────── │   ┌─────────────────────────────────────────────────┐  │
│              │   │ 📄 Processo de reembolso                        │  │
│  💎 Upgrade  │   │    8 passos • Criado há 5 dias • 23 views       │  │
│  Pro         │   │    [Editar] [Compartilhar] [Duplicar] [...]     │  │
│              │   └─────────────────────────────────────────────────┘  │
│              │                                                         │
│              │   ┌─────────────────────────────────────────────────┐  │
│              │   │ 📄 Emissão de nota fiscal                       │  │
│              │   │    15 passos • Criado há 1 semana • 89 views    │  │
│              │   │    [Editar] [Compartilhar] [Duplicar] [...]     │  │
│              │   └─────────────────────────────────────────────────┘  │
│              │                                                         │
└──────────────┴─────────────────────────────────────────────────────────┘
```

### 5.6 Wireframe - Editor de Procedimento

```
┌────────────────────────────────────────────────────────────────────────┐
│  ← Voltar    Como cadastrar cliente no CRM         [Salvar] [Publicar] │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌─────────────────────────────┐  ┌─────────────────────────────────┐ │
│  │     PREVIEW DO PASSO        │  │        EDITAR PASSO             │ │
│  │                             │  │                                 │ │
│  │  ┌─────────────────────┐   │  │  Título:                        │ │
│  │  │                     │   │  │  ┌─────────────────────────────┐│ │
│  │  │   [Screenshot com   │   │  │  │ Clique em "Novo Cliente"    ││ │
│  │  │    anotações]       │   │  │  └─────────────────────────────┘│ │
│  │  │         ⭕→         │   │  │                                 │ │
│  │  │                     │   │  │  Descrição:                     │ │
│  │  └─────────────────────┘   │  │  ┌─────────────────────────────┐│ │
│  │                             │  │  │ No menu lateral, localize  ││ │
│  │  Passo 3 de 12              │  │  │ e clique no botão "Novo    ││ │
│  │  ◀ Anterior    Próximo ▶   │  │  │ Cliente" para iniciar...   ││ │
│  │                             │  │  └─────────────────────────────┘│ │
│  └─────────────────────────────┘  │                                 │ │
│                                    │  🖼️ Editar anotações           │ │
│  TODOS OS PASSOS:                  │  🗑️ Excluir passo              │ │
│  [1] [2] [3●] [4] [5] [6]...      │  ↕️ Reordenar                   │ │
│                                    └─────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Modelo de Negócio

### Estrutura de Preços

| Plano | Preço | Procedimentos/mês | Usuários | Features |
|-------|-------|-------------------|----------|----------|
| **Gratuito** | R$ 0 | 3 | 1 | Exportação PDF, marca d'água |
| **Starter** | R$ 49/mês | 20 | 1 | Sem marca d'água, link público |
| **Pro** | R$ 149/mês | 100 | 5 | + Notion, Google Docs, analytics |
| **Business** | R$ 349/mês | Ilimitado | 15 | + API, SSO, suporte prioritário |

### Estratégia de Lifetime Deal (Lançamento)

Seguindo o playbook validado por Mike (3 SaaS, $200K MRR), iniciaremos com uma campanha de Lifetime Deal para gerar caixa inicial e validar demanda rapidamente:

| Oferta LTD | Preço | Quantidade | Inclui |
|------------|-------|------------|--------|
| Early Bird | R$ 197 | 100 unidades | Plano Pro vitalício |
| Padrão | R$ 297 | 200 unidades | Plano Pro vitalício |
| Final | R$ 397 | 100 unidades | Plano Business vitalício |

**Meta: R$ 100.000 em LTD antes de migrar para assinatura mensal**

### Unit Economics

| Métrica | Valor | Benchmark SaaS |
|---------|-------|----------------|
| ARPU (Receita média por usuário) | R$ 100/mês | Bom para B2B SMB |
| CAC (Custo de aquisição) | R$ 120 | < 3 meses de receita ✓ |
| LTV (Valor vitalício - 12 meses) | R$ 1.000 | Churn 8% mensal |
| LTV/CAC Ratio | 8.3x | Excelente (>3x é bom) |
| Payback Period | 1.2 meses | Excelente (<12 meses) |
| Margem Bruta | ~75% | Padrão SaaS |

### Custos Operacionais Mensais

| Item | Custo | Observação |
|------|-------|------------|
| API OpenAI/Claude (IA) | ~R$ 0,15/procedimento | Escala com uso |
| Supabase (DB + Storage) | R$ 125/mês | Plano Pro |
| Vercel (Hosting) | R$ 100/mês | Plano Pro |
| Domínio + Email | R$ 50/mês | procedura.ai + Google Workspace |
| Ferramentas (Analytics, etc) | R$ 100/mês | Mixpanel, Hotjar |
| **Total Fixo** | **~R$ 375/mês** | Antes de escala |

---

## 7. Estratégia Go-to-Market

### Fase 1: Pré-Lançamento (Semanas 1-4)

- **Landing page com lista de espera:** Capturar emails com oferta de 50% off para os primeiros 100
- **Conteúdo educativo:** 3 posts de blog sobre 'como documentar processos' para SEO
- **Comunidades:** Participação ativa em 5 grupos de agências no Facebook/WhatsApp
- **LinkedIn:** 2 posts por semana sobre o problema de documentação
- **Meta:** 500 emails na lista de espera

### Fase 2: Lançamento LTD (Semanas 5-8)

- **Grupos de LTD brasileiros:** AppSumo Brasil, LTD Brasil, SaaS para Brasileiros
- **Product Hunt Brasil:** Lançamento coordenado com comunidade
- **LinkedIn Ads:** Budget R$ 500 para retargeting da lista de espera
- **Email marketing:** Sequência de 5 emails para lista de espera
- **Meta:** 300 vendas LTD (R$ 80K+)

### Fase 3: Escala (Meses 3-12)

- **SEO:** 20+ páginas de comparação, blog com tutoriais, programmatic SEO
- **Meta Ads:** Budget inicial R$ 1.000/mês, escalar conforme ROAS > 3
- **Google Ads:** Keywords de alta intenção: 'criar sop', 'documentar processos'
- **Parcerias:** Integrações com RD Station, Pipefy, Bling
- **Afiliados:** Programa com 30% de comissão recorrente no primeiro ano
- **Meta:** R$ 50K MRR ao final de 12 meses

### Priorização de Canais

| Canal | Custo | Esforço | Tempo p/ Resultado | Prioridade |
|-------|-------|---------|-------------------|------------|
| Comunidades/Grupos | Baixo | Alto | Imediato | 🟢 Alta |
| SEO/Conteúdo | Baixo | Alto | 3-6 meses | 🟢 Alta |
| LinkedIn Orgânico | Baixo | Médio | 1-2 meses | 🟢 Alta |
| LTD Marketplaces | Médio | Médio | Imediato | 🟢 Alta |
| Meta Ads | Médio | Médio | Imediato | 🟡 Média |
| Google Ads | Alto | Baixo | Imediato | 🟡 Média |
| Afiliados | Variável | Baixo | 2-3 meses | 🟡 Média |

---

## 8. Copy para Landing Page

### 8.1 Estrutura da Landing Page

| Seção | Objetivo | Elementos |
|-------|----------|-----------|
| **Hero** | Capturar atenção, comunicar valor | Headline, subheadline, CTA, visual do produto |
| **Problema** | Gerar identificação | Dores do público, estatísticas |
| **Solução** | Mostrar como funciona | 3 passos simples, GIF/vídeo demo |
| **Features** | Detalhar benefícios | 4-6 features com ícones |
| **Social Proof** | Gerar confiança | Depoimentos, logos de clientes, números |
| **Pricing** | Converter | Tabela de planos, destaque Pro |
| **FAQ** | Eliminar objeções | 5-7 perguntas frequentes |
| **CTA Final** | Última chance de conversão | Headline + botão + garantia |

### 8.2 Copy Completo

#### HERO SECTION

**Headline Principal:**
> # Transforme 2 Horas de Trabalho em 5 Minutos

**Subheadline:**
> Grave qualquer processo no seu navegador e deixe a IA criar documentação profissional automaticamente. Sem esforço. Sem capturas manuais. Sem enrolação.

**CTA Principal:**
> [Começar Grátis →] (Sem cartão de crédito)

**Prova Social Rápida:**
> ✓ +500 empresas já documentaram seus processos | ✓ 4.9/5 avaliação média

---

#### SEÇÃO PROBLEMA

**Headline:**
> ## Criar SOPs Não Deveria Consumir Seu Dia Inteiro

**Texto:**
Você já perdeu horas fazendo isso:

- 📸 Fazer dezenas de capturas de tela manualmente
- ✍️ Escrever descrições para cada passo
- 🎨 Formatar tudo em um documento apresentável
- 🔄 Atualizar quando o processo muda
- 😰 Refazer tudo quando alguém sai da empresa

**E se você pudesse simplesmente... fazer a tarefa uma vez e ter a documentação pronta?**

---

#### SEÇÃO SOLUÇÃO

**Headline:**
> ## Como Funciona (É Ridiculamente Simples)

**3 Passos:**

1. **Clique em Gravar** — Ative a extensão e faça a tarefa normalmente
2. **Execute o Processo** — A IA captura cada clique, cada tela, cada ação
3. **Receba seu SOP** — Em segundos, documentação profissional pronta para compartilhar

[ESPAÇO PARA GIF/VÍDEO DEMONSTRATIVO]

---

#### SEÇÃO FEATURES

**Headline:**
> ## Tudo Que Você Precisa Para Documentar Processos

| Feature | Descrição |
|---------|-----------|
| 🤖 **IA em Português Nativo** | Textos gerados como brasileiro escreve. Nada de traduções estranhas. |
| 📸 **Capturas Automáticas** | Screenshots de cada passo com anotações visuais (setas, destaques). |
| 📄 **Exportação Flexível** | PDF, Notion, Google Docs ou link público para compartilhar. |
| 👥 **Feito para Times** | Workspaces colaborativos, permissões, versionamento. |
| ⚡ **Pronto em Segundos** | Processamento com IA leva menos de 1 minuto. |
| 💰 **Preço Justo em Real** | Sem surpresas em dólar. PIX e boleto aceitos. |

---

#### SEÇÃO SOCIAL PROOF

**Headline:**
> ## Empresas Que Já Transformaram Sua Documentação

**Depoimento 1:**
> "Antes eu levava uma tarde inteira para documentar um processo. Agora faço em 5 minutos. Literalmente mudou como nossa agência funciona."
> 
> — **Maria S.**, Diretora de Operações, Agência XYZ

**Depoimento 2:**
> "Onboarding de novos funcionários era um pesadelo. Com o ProceduraAI, tenho todos os processos documentados e atualizados. Reduzimos o tempo de treinamento em 60%."
> 
> — **Carlos R.**, CEO, StartupABC

**Métricas:**
> **500+** empresas | **10.000+** procedimentos criados | **50.000+** horas economizadas

---

#### SEÇÃO PRICING

**Headline:**
> ## Escolha Seu Plano

**Subheadline:**
> Comece grátis. Upgrade quando precisar. Cancele quando quiser.

[Tabela de Preços - mesmo formato da seção 6]

**Garantia:**
> 🛡️ **Garantia de 7 dias.** Se não gostar, devolvemos seu dinheiro. Sem perguntas.

---

#### SEÇÃO FAQ

**Perguntas Frequentes:**

**P: Funciona em qualquer site?**
R: Sim! A extensão funciona em qualquer site ou aplicação web que você acesse pelo Chrome.

**P: Precisa instalar algo no computador?**
R: Apenas a extensão do Chrome. Leva 30 segundos para instalar.

**P: Os dados são seguros?**
R: Sim. Usamos criptografia de ponta a ponta e seus dados ficam em servidores brasileiros.

**P: Posso cancelar a qualquer momento?**
R: Sim, sem multas ou taxas. Você mantém acesso até o fim do período pago.

**P: Funciona para processos fora do navegador?**
R: Atualmente apenas processos web. Desktop e mobile estão no roadmap.

**P: Tem API para integração?**
R: Sim, disponível no plano Business. Documentação completa disponível.

---

#### CTA FINAL

**Headline:**
> ## Pronto Para Parar de Perder Tempo Com Documentação?

**Subheadline:**
> Junte-se a +500 empresas que já automatizaram seus processos.

**CTA:**
> [Criar Conta Grátis →]

**Micro-copy:**
> Setup em 2 minutos. Sem cartão de crédito.

---

## 9. Estratégia de SEO

### 9.1 Pesquisa de Keywords

Foco em keywords de alta intenção (bottom-funnel) e keywords educacionais (top-funnel) para construir autoridade:

| Keyword | Volume (BR) | Dificuldade | Intenção | Prioridade |
|---------|-------------|-------------|----------|------------|
| como criar sop | 720/mês | Baixa | Informacional | 🟢 Alta |
| procedimento operacional padrão | 1.900/mês | Média | Informacional | 🟢 Alta |
| documentar processos empresa | 390/mês | Baixa | Informacional | 🟢 Alta |
| software para criar sop | 110/mês | Baixa | Transacional | 🟢 Alta |
| ferramenta documentação processos | 90/mês | Baixa | Transacional | 🟢 Alta |
| scribe alternativa | 50/mês | Baixa | Transacional | 🟢 Alta |
| tango app alternativa | 30/mês | Baixa | Transacional | 🟢 Alta |
| template sop gratuito | 480/mês | Média | Informacional | 🟡 Média |
| onboarding funcionários | 1.300/mês | Alta | Informacional | 🟡 Média |
| gestão do conhecimento | 880/mês | Alta | Informacional | 🟡 Média |

### 9.2 Estrutura de Conteúdo

| Pilar | Tipo | Exemplos de Posts | Meta |
|-------|------|-------------------|------|
| **SOPs e Documentação** | Educacional | O que é SOP, Como criar SOP, Templates | 20 posts |
| **Comparativos** | Transacional | ProceduraAI vs Scribe, vs Tango, vs Loom | 10 páginas |
| **Casos de Uso** | Educacional | SOP para agências, para startups, para CS | 15 posts |
| **Tutoriais** | Suporte | Como usar ProceduraAI, integrações, dicas | 10 posts |
| **Glossário** | SEO Programático | Termos: SOP, POP, Workflow, Processo | 30 páginas |

### 9.3 Calendário de Conteúdo (Primeiros 3 Meses)

| Semana | Post 1 | Post 2 |
|--------|--------|--------|
| 1 | O que é SOP e por que sua empresa precisa | Landing page otimizada |
| 2 | Como criar um SOP em 5 passos simples | ProceduraAI vs Scribe: Comparativo completo |
| 3 | 7 erros comuns ao documentar processos | Template SOP gratuito [Lead magnet] |
| 4 | SOPs para agências de marketing: Guia completo | ProceduraAI vs Tango: Qual escolher? |
| 5 | Como treinar novos funcionários com SOPs | 10 processos que toda startup deve documentar |
| 6 | Documentação de processos para times remotos | ProceduraAI vs Loom: Diferenças |
| 7 | ROI de documentar processos: Como calcular | Case study: Agência XYZ |
| 8 | Gestão do conhecimento: Guia para PMEs | Glossário: 30 termos de processos |
| 9-12 | Continuar calendário + atualizar posts antigos | Expandir comparativos |

### 9.4 SEO On-Page Checklist

- ✓ Title tag com keyword principal (máx 60 caracteres)
- ✓ Meta description persuasiva com CTA (máx 155 caracteres)
- ✓ H1 único com keyword principal
- ✓ H2s e H3s com keywords secundárias
- ✓ URL amigável e curta (/como-criar-sop)
- ✓ Imagens otimizadas com alt text descritivo
- ✓ Links internos para posts relacionados (mín 3)
- ✓ Link externo para fonte autoritativa (mín 1)
- ✓ Schema markup (Article, FAQ, HowTo)
- ✓ Tempo de carregamento < 3 segundos
- ✓ Mobile-friendly (responsive)
- ✓ CTA claro no conteúdo

### 9.5 Link Building Strategy

| Tática | Esforço | Impacto | Ação |
|--------|---------|---------|------|
| Guest Posts | Alto | Alto | Escrever para blogs de marketing/gestão (RD, Resultados Digitais) |
| HARO/Connectively | Médio | Alto | Responder queries de jornalistas sobre produtividade |
| Parcerias | Médio | Médio | Trocar links com ferramentas complementares |
| Menções de marca | Baixo | Médio | Monitorar e pedir link quando mencionado sem link |
| Diretórios SaaS | Baixo | Baixo | Cadastrar em Capterra, G2, GetApp Brasil |
| Conteúdo linkável | Alto | Alto | Criar pesquisas originais, infográficos, templates |

### 9.6 SEO Técnico

- **Sitemap XML:** Gerado automaticamente pelo Next.js, submetido ao Google Search Console
- **Robots.txt:** Configurado para permitir crawling de todas as páginas públicas
- **Canonical URLs:** Implementadas para evitar conteúdo duplicado
- **Structured Data:** Schema.org para Organization, Product, FAQ, HowTo, Article
- **Core Web Vitals:** LCP < 2.5s, FID < 100ms, CLS < 0.1 (Vercel + Next.js otimizam isso)
- **HTTPS:** SSL em todas as páginas (padrão Vercel)
- **Hreflang:** Preparado para expansão PT-PT no futuro
- **Breadcrumbs:** Implementados com schema para navegação

### 9.7 KPIs de SEO

| KPI | Meta 3 meses | Meta 6 meses | Meta 12 meses |
|-----|--------------|--------------|---------------|
| Tráfego orgânico/mês | 1.000 | 5.000 | 15.000 |
| Keywords no top 10 | 10 | 30 | 100 |
| Domain Rating (Ahrefs) | 10 | 20 | 35 |
| Backlinks | 20 | 50 | 150 |
| Conversão orgânico→trial | 3% | 4% | 5% |

---

## 10. Projeções Financeiras

### Projeção de Receita (12 meses)

| Mês | Clientes | MRR | LTD | Total | Custos | Lucro |
|-----|----------|-----|-----|-------|--------|-------|
| 1 | 20 | R$ 1.000 | R$ 30.000 | R$ 31.000 | R$ 2.000 | R$ 29.000 |
| 2 | 50 | R$ 4.000 | R$ 40.000 | R$ 44.000 | R$ 2.500 | R$ 41.500 |
| 3 | 80 | R$ 7.000 | R$ 30.000 | R$ 37.000 | R$ 3.000 | R$ 34.000 |
| 4 | 120 | R$ 11.000 | - | R$ 11.000 | R$ 3.500 | R$ 7.500 |
| 5 | 160 | R$ 15.000 | - | R$ 15.000 | R$ 4.000 | R$ 11.000 |
| 6 | 200 | R$ 19.000 | - | R$ 19.000 | R$ 4.500 | R$ 14.500 |
| 9 | 320 | R$ 32.000 | - | R$ 32.000 | R$ 6.000 | R$ 26.000 |
| 12 | 500 | R$ 50.000 | - | R$ 50.000 | R$ 8.000 | R$ 42.000 |

### Resumo Financeiro Ano 1

| Métrica | Valor |
|---------|-------|
| Receita Total (LTD + MRR) | R$ 380.000 |
| Custos Operacionais | R$ 48.000 |
| Marketing/Ads | R$ 24.000 |
| **Lucro Bruto** | **R$ 308.000** |
| Margem | 81% |
| MRR Final (Mês 12) | R$ 50.000 |
| ARR Projetado (Ano 2) | R$ 600.000 |

### Investimento Inicial Necessário

| Item | Valor |
|------|-------|
| Desenvolvimento (8 semanas) | R$ 0 (trabalho próprio) |
| Infraestrutura (3 meses) | R$ 1.200 |
| Marketing Pré-Lançamento | R$ 500 |
| Conta Developer Chrome | R$ 30 (única) |
| Reserva de Contingência | R$ 1.500 |
| **Total** | **R$ 3.230** |

### Break-even Analysis

Com custos fixos de ~R$ 375/mês e margem de ~75%, o break-even ocorre com aproximadamente R$ 500/mês de receita recorrente (5 clientes no plano Starter). Isso deve ser atingido no primeiro mês com a estratégia de LTD.

---

## 11. Riscos e Mitigações

| Risco | Prob. | Impacto | Mitigação |
|-------|-------|---------|-----------|
| Custos de IA escalarem | Média | Alto | Cache agressivo, modelos mais baratos para tarefas simples, limites no free |
| Concorrente gringo entrar no BR | Média | Médio | Construir comunidade forte, integrações locais, preço imbatível |
| Baixa adoção inicial | Baixa | Alto | LTD valida rápido, pivotar features com feedback |
| Mudanças API do Chrome | Baixa | Alto | Manifest V3 (padrão atual), monitorar changelog |
| Churn alto | Média | Alto | Foco em stickiness, onboarding excepcional, suporte proativo |
| Problemas técnicos na extensão | Média | Médio | Testes extensivos, beta fechado, rollout gradual |
| LGPD/Compliance | Baixa | Alto | Política de privacidade clara, dados em servidores BR, opt-in explícito |

### Plano de Contingência

- **Se LTD não vender:** Pivotar para freemium agressivo + content marketing puro
- **Se custos de IA explodirem:** Migrar para modelos open-source (Llama, Mistral)
- **Se churn > 10%:** Implementar exit surveys, dobrar investimento em onboarding
- **Se Chrome rejeitar extensão:** Desenvolver versão desktop app como backup

---

## 12. Cronograma e Próximos Passos

### Cronograma de Desenvolvimento (8 semanas)

| Semana | Entregas | Horas |
|--------|----------|-------|
| 1 | Setup projeto, estrutura extensão Chrome, auth Supabase, landing page | 25h |
| 2 | Captura de tela e cliques na extensão, storage local, upload | 30h |
| 3 | API de processamento, integração GPT-4, geração de texto | 30h |
| 4 | Anotações visuais automáticas, editor de revisão | 25h |
| 5 | Dashboard web, listagem de procedimentos, exportação PDF | 25h |
| 6 | Pagamentos (Stripe + PIX), planos, onboarding | 20h |
| 7 | Testes, correções, publicação Chrome Web Store | 20h |
| 8 | Beta fechado com 20 usuários, coleta de feedback, iteração | 15h |

**Total: 190 horas (~8 semanas trabalhando 25h/semana)**

### Próximos Passos Imediatos

- **Hoje:** Registrar domínio procedura.ai
- **Dia 1-2:** Setup repositório, estrutura de pastas, CI/CD
- **Dia 3-5:** Landing page no ar com lista de espera
- **Semana 1:** Primeira versão funcional da extensão (captura básica)
- **Semana 2:** Integração com Supabase funcionando
- **Semana 3:** Primeira geração de SOP com IA funcionando end-to-end
- **Semana 4:** MVP completo para beta fechado

---

## Conclusão

O ProceduraAI representa uma oportunidade clara de mercado: demanda validada globalmente por ferramentas como Scribe e Tango, combinada com ausência total de concorrência em português nativo. O modelo de negócio é de baixo risco (LTD inicial para validação) e alto potencial de retorno (margens >75%).

Com investimento inicial mínimo (~R$ 3.000) e 8 semanas de desenvolvimento, o produto pode atingir R$ 50K MRR em 12 meses, gerando um negócio sustentável e escalável com potencial de expansão para outros mercados de língua portuguesa.

---

### **A hora de executar é agora.**

---

*Documento gerado em Janeiro 2026*
