import React from 'react';
import { useNavigate } from 'react-router-dom';

const beneficiosCliente = [
  {
    titulo: 'Pontos automáticos',
    texto: 'Cada atendimento gera BellaPoints de forma transparente e instantânea, sem esforço na hora da visita.'
  },
  {
    titulo: 'Histórico claro',
    texto: 'Você acompanha ganhos, resgates e evolução do seu saldo em um painel simples e intuitivo.'
  },
  {
    titulo: 'Recompensas reais',
    texto: 'Troque pontos por descontos, serviços ou benefícios exclusivos, sempre com clareza sobre o saldo e as condições.'
  }
];

const beneficiosSalao = [
  {
    titulo: 'Gestão mais inteligente',
    texto: 'Controle clientes, serviços e históricos com mais agilidade, sem depender de processos manuais e repetitivos.'
  },
  {
    titulo: 'Fidelização em escala',
    texto: 'Crie uma rotina de recorrência com pontos, benefícios e o acompanhamento ideal para cada cliente.'
  },
  {
    titulo: 'Confiança e segurança',
    texto: 'A validação dos pontos e dos movimentos é feita com transparência, reduzindo erros e fortalecendo a relação com o cliente.'
  }
];

const passos = [
  'O cliente realiza o atendimento no salão.',
  'O sistema calcula automaticamente os BellaPoints com base no serviço realizado.',
  'Os pontos são registrados com segurança e rastreabilidade.',
  'O cliente acessa seu saldo e pode resgatar recompensas ou benefícios.'
];

export default function SobreBellaChain() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-zinc-200 text-gray-800">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 right-10 h-72 w-72 rounded-full bg-gradient-to-r from-zinc-300 to-stone-300 blur-3xl opacity-60"></div>
        <div className="absolute bottom-0 left-10 h-72 w-72 rounded-full bg-gradient-to-r from-neutral-300 to-slate-300 blur-3xl opacity-60"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-8 lg:px-8 lg:py-10">
        <header className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-3xl font-light tracking-[0.25em] text-gray-800"
          >
            BELLA<span className="font-bold">CHAIN</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="rounded-full border border-zinc-300 bg-white px-5 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition hover:border-zinc-400 hover:shadow-md"
            >
              Início
            </button>
            <button
              onClick={() => navigate('/login?tipo=cliente')}
              className="rounded-full bg-zinc-800 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-zinc-700"
            >
              Entrar
            </button>
          </div>
        </header>

        <main className="pt-12 lg:pt-16">
          <section className="rounded-[2rem] border border-gray-200 bg-white/80 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm lg:p-12">
            <div className="grid items-center gap-10 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="space-y-6">
                <div className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-600">
                  BellaChain
                </div>

                <h1 className="text-4xl font-light leading-tight tracking-tight text-zinc-900 md:text-5xl">
                  O sistema que transforma cada visita em valor real.
                </h1>

                <p className="max-w-xl text-lg leading-relaxed text-zinc-600">
                  O BellaChain foi pensado para modernizar a fidelização de salões de beleza. Ele une experiência do cliente, gestão do salão e tecnologia para criar um programa de pontos que é simples, transparente e realmente útil.
                </p>

                <div className="flex flex-col gap-4 sm:flex-row">
                  <button
                    onClick={() => navigate('/login?tipo=cliente')}
                    className="rounded-full bg-zinc-800 px-7 py-3.5 text-base font-semibold text-white shadow-lg transition hover:bg-zinc-700"
                  >
                    Começar agora
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="rounded-full border border-zinc-300 bg-white px-7 py-3.5 text-base font-semibold text-zinc-700 shadow-sm transition hover:border-zinc-400"
                  >
                    Voltar ao início
                  </button>
                </div>
              </div>

              <div className="rounded-[1.75rem] bg-[#f5f3f0] p-8 shadow-inner">
                <div className="space-y-4 text-center">
                  <div className="flex items-center justify-center gap-3 text-[clamp(2.1rem,4vw,5rem)] leading-none tracking-[-0.08em] text-zinc-500">
                    <span className="text-[0.38em]">∞</span>
                    <span className="font-light">BELLA CHAIN</span>
                    <span className="text-[0.38em]">∞</span>
                  </div>
                  <div className="text-[0.8rem] tracking-[0.35em] text-zinc-500 uppercase">
                    Salão de beleza
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-20">
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-zinc-500">O que é</p>
              <h2 className="text-3xl font-light tracking-tight text-zinc-900 md:text-4xl">
                Uma experiência pensada para clientes e salões.
              </h2>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-zinc-200 bg-white p-7 shadow-sm">
                <h3 className="mb-4 text-2xl font-semibold text-zinc-900">Para o cliente</h3>
                <p className="text-base leading-relaxed text-zinc-600">
                  Cada cuidado vira pontos e cada ponto vira vantagem. O cliente entende o valor do seu tempo, da sua fidelidade e pode acompanhar tudo em tempo real.
                </p>
              </div>

              <div className="rounded-3xl border border-zinc-200 bg-white p-7 shadow-sm">
                <h3 className="mb-4 text-2xl font-semibold text-zinc-900">Para o salão</h3>
                <p className="text-base leading-relaxed text-zinc-600">
                  A gestão fica mais eficiente, a retenção melhora e o relacionamento com os clientes se torna mais forte por meio de um programa moderno e confiável.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-20">
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-zinc-500">Como funciona</p>
              <h2 className="text-3xl font-light tracking-tight text-zinc-900 md:text-4xl">
                Simples, rápido e transparente.
              </h2>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {passos.map((passo, index) => (
                <div key={passo} className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
                    {index + 1}
                  </div>
                  <p className="text-base leading-relaxed text-zinc-700">{passo}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-20 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-zinc-500">Clientes</p>
              <h3 className="mb-6 text-3xl font-light tracking-tight text-zinc-900">Mais valor em cada cuidado.</h3>
              <div className="space-y-4">
                {beneficiosCliente.map((item) => (
                  <div key={item.titulo} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                    <h4 className="mb-2 text-lg font-semibold text-zinc-900">{item.titulo}</h4>
                    <p className="text-sm leading-relaxed text-zinc-600">{item.texto}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-zinc-500">Salões</p>
              <h3 className="mb-6 text-3xl font-light tracking-tight text-zinc-900">Gestão inteligente e mais recorrência.</h3>
              <div className="space-y-4">
                {beneficiosSalao.map((item) => (
                  <div key={item.titulo} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                    <h4 className="mb-2 text-lg font-semibold text-zinc-900">{item.titulo}</h4>
                    <p className="text-sm leading-relaxed text-zinc-600">{item.texto}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-20 rounded-[2rem] border border-zinc-200 bg-zinc-900 p-8 text-white shadow-lg md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-zinc-300">Segurança</p>
                <h3 className="text-3xl font-light tracking-tight text-white md:text-4xl">
                  Transparência e confiabilidade em cada movimento.
                </h3>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 text-zinc-200">
                <p className="text-base leading-relaxed">
                  O BellaChain foi construído para reduzir erros, evitar fraudes e dar clareza total ao cliente e ao salão sobre ganhos, resgates e histórico de pontos.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-20 pb-12 text-center">
            <button
              onClick={() => navigate('/login?tipo=cliente')}
              className="rounded-full bg-zinc-800 px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-zinc-700"
            >
              Quero entrar no BellaChain
            </button>
          </section>
        </main>
      </div>
    </div>
  );
}
