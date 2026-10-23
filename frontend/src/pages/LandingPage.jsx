import React from 'react';
import { useNavigate } from 'react-router-dom';

const abrirLogin = (tipo = 'cliente') => `/login?tipo=${tipo}`;

const clienteBeneficios = [
  'Tudo na palma da mão: acompanhe cadastro, saldo e histórico em um só lugar.',
  'Segurança e confiança total: seus BellaPoints são protegidos com transparência.',
  'Recompensas exclusivas: veja descontos, produtos e serviços disponíveis para resgate.',
  'Valorização real: cada cuidado vira pontos e cada ponto vira vantagem.',
];

const salonBeneficios = [
  'Geração automática de pontos com base no valor do serviço realizado.',
  'Gestão completa e integrada de clientes, funcionários e serviços.',
  'Métricas e relatórios estratégicos para decisões mais inteligentes.',
  'Confiança inabalável com processos mais seguros e transparentes.',
];

const passos = [
  'Atendimento realizado: o profissional registra o serviço concluído.',
  'Geração de BellaPoints: o sistema calcula e credita automaticamente.',
  'Proteção e rastreabilidade: cada movimentação fica registrada com segurança.',
  'Resgate de recompensas: o cliente consulta o saldo e aproveita benefícios.',
];

export default function LandingPage() {
  const navigate = useNavigate();
  const appVersion = 'v1.0.0';

  return (
    <div className="min-h-screen bg-[#f3f3f1] text-zinc-800">
      <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-[2.1rem] font-light tracking-[0.26em] text-zinc-800">
              BELLA<span className="font-semibold tracking-[0.18em] text-zinc-700">CHAIN</span>
            </div>
            <span className="rounded-full border border-zinc-300 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600 shadow-sm">
              {appVersion}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(abrirLogin('cliente'))}
              className="rounded-full border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 shadow-sm transition hover:border-zinc-400 hover:shadow-md"
            >
              Entrar
            </button>
          </div>
        </header>

        <main className="space-y-20 pt-12 lg:pt-16">
          <section className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <div className="inline-flex items-center rounded-full border border-zinc-200 bg-white/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-600">
                Fidelidade inteligente e segura
              </div>

              <div className="space-y-4">
                <h1 className="text-5xl font-light leading-tight tracking-[-0.05em] text-zinc-900 lg:text-6xl">
                  Transforme cada cuidado em
                  <span className="block font-medium text-zinc-800">recompensas inesquecíveis.</span>
                </h1>

                <p className="max-w-xl text-lg leading-relaxed text-zinc-600">
                  Conheça o <span className="font-semibold text-zinc-900">BellaChain</span>, o sistema de fidelidade feito sob medida para salões de beleza. Mais segurança, transparência e um programa de pontos que realmente valoriza você e o seu salão.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  onClick={() => navigate('/sobre')}
                  className="rounded-full bg-zinc-800 px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-zinc-700"
                >
                  Quero conhecer o BellaChain
                </button>

                <button
                  onClick={() => navigate('/sobre')}
                  className="rounded-full border border-zinc-300 bg-white px-8 py-4 text-base font-semibold text-zinc-700 shadow-sm transition hover:border-zinc-400 hover:shadow-md"
                >
                  Para Donos de Salão
                </button>
              </div>
            </div>

            <div className="rounded-[2rem] border border-zinc-200 bg-white/80 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm">
              <div className="flex h-full min-h-[360px] items-center justify-center rounded-[1.5rem] bg-[#f5f3f0] p-8 text-center text-zinc-700 shadow-xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3 text-[clamp(2.4rem,4vw,5.5rem)] leading-none tracking-[-0.08em] text-zinc-600">
                    <span className="text-[0.35em] font-light text-zinc-500">∞</span>
                    <span className="text-[1.1em] font-light tracking-[0.12em]">BELLA CHAIN</span>
                    <span className="text-[0.35em] font-light text-zinc-500">∞</span>
                  </div>
                  <div className="text-[clamp(0.7rem,1.2vw,1.3rem)] tracking-[0.35em] text-zinc-500 uppercase">
                    Salão de beleza
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-zinc-500">O que é o BellaChain?</p>
              <h2 className="mt-4 text-3xl font-light tracking-[-0.04em] text-zinc-900 lg:text-5xl">
                O sistema de fidelidade pensado para modernizar a experiência de ir ao salão.
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm">
                <h3 className="mb-4 text-2xl font-light text-zinc-900">Um novo jeito de valorizar cada cuidado</h3>
                <p className="text-lg leading-relaxed text-zinc-600">
                  O <span className="font-semibold text-zinc-900">BellaChain</span> nasceu para modernizar a experiência de ir ao salão de beleza. Unimos o cuidado com a sua autoestima a um sistema moderno e totalmente confiável.
                </p>
                <p className="mt-4 text-lg leading-relaxed text-zinc-600">
                  Cada atendimento realizado no salão se transforma em <span className="font-semibold text-zinc-900">BellaPoints</span> — pontos digitais exclusivos que ficam guardados com segurança máxima e total transparência.
                </p>
              </div>

              <div className="rounded-[2rem] border border-zinc-200 bg-[#f8f5f2] p-8 shadow-sm">
                <h3 className="mb-4 text-2xl font-light text-zinc-900">Conquistas que realmente importam</h3>
                <p className="text-lg leading-relaxed text-zinc-600">
                  Suas conquistas e recompensas nunca se perdem e estão sempre sob o seu controle. O cliente pode acompanhar ganhos, resgates e benefícios com clareza e praticidade.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-zinc-500">Para clientes</p>
              <h2 className="mt-4 text-3xl font-light tracking-[-0.04em] text-zinc-900 lg:text-5xl">
                Por que você vai amar o BellaChain?
              </h2>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {clienteBeneficios.map((item, index) => (
                <div key={index} className="rounded-[1.6rem] border border-zinc-200 bg-white p-6 shadow-sm">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
                    {index + 1}
                  </div>
                  <p className="text-lg leading-relaxed text-zinc-700">{item}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-2">
              <button
                onClick={() => navigate(abrirLogin('cliente'))}
                className="rounded-full bg-zinc-800 px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-zinc-700"
              >
                Quero participar e ganhar BellaPoints!
              </button>
            </div>
          </section>

          <section className="space-y-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-zinc-500">Para donos de salões</p>
              <h2 className="mt-4 text-3xl font-light tracking-[-0.04em] text-zinc-900 lg:text-5xl">
                Potencialize o seu negócio com a BellaChain.
              </h2>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {salonBeneficios.map((item, index) => (
                <div key={index} className="rounded-[1.6rem] border border-zinc-200 bg-white p-6 shadow-sm">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#efe7df] text-sm font-semibold text-zinc-800">
                    {index + 1}
                  </div>
                  <p className="text-lg leading-relaxed text-zinc-700">{item}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-2">
              <button
                onClick={() => navigate(abrirLogin('funcionario'))}
                className="rounded-full bg-[#efe7df] px-8 py-4 text-base font-semibold text-zinc-800 shadow-sm transition hover:bg-[#e5dcd1]"
              >
                Leve o BellaChain para o meu salão
              </button>
            </div>
          </section>

          <section className="space-y-8 pb-12">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-zinc-500">Como funciona?</p>
              <h2 className="mt-4 text-3xl font-light tracking-[-0.04em] text-zinc-900 lg:text-5xl">
                É simples, rápido e seguro.
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {passos.map((passo, index) => (
                <div key={index} className="rounded-[1.6rem] border border-zinc-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Passo {index + 1}</div>
                  <p className="text-lg leading-relaxed text-zinc-700">{passo}</p>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
