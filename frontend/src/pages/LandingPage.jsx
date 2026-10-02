import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-800">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 right-10 h-72 w-72 rounded-full bg-gradient-to-r from-purple-200 to-pink-200 blur-3xl opacity-60"></div>
        <div className="absolute bottom-0 left-10 h-72 w-72 rounded-full bg-gradient-to-r from-rose-200 to-orange-200 blur-3xl opacity-60"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 lg:py-16">
        <header className="flex items-center justify-between">
          <div className="text-3xl font-light tracking-[0.25em] text-gray-800">
            BELLA<span className="font-bold">CHAIN</span>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="rounded-full border border-gray-300 bg-white px-6 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-400 hover:shadow-md"
          >
            Entrar
          </button>
        </header>

        <main className="grid items-center gap-12 pt-16 lg:grid-cols-2 lg:pt-24">
          <div className="space-y-8">
            <div className="inline-flex items-center rounded-full border border-gray-200 bg-white/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-gray-600 shadow-sm">
              Fidelidade inteligente
            </div>

            <div className="space-y-5">
              <h1 className="text-5xl font-light leading-tight tracking-tight text-gray-900 lg:text-6xl">
                Realce sua beleza,
                <span className="block font-semibold">premie sua fidelidade.</span>
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-gray-600">
                Acumule pontos em cada atendimento, resgate recompensas exclusivas e acompanhe o histórico do seu salão em uma experiência moderna, elegante e automatizada.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                onClick={() => navigate('/login')}
                className="rounded-full bg-gradient-to-r from-gray-800 to-gray-600 px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:opacity-95"
              >
                Acessar plataforma
              </button>
              <button
                onClick={() => navigate('/login')}
                className="rounded-full border border-gray-300 bg-white px-8 py-4 text-base font-semibold text-gray-700 shadow-sm transition hover:border-gray-400 hover:shadow-md"
              >
                Criar conta
              </button>
            </div>

            <div className="flex items-center gap-6 pt-4 text-sm text-gray-500">
              <div>
                <span className="block text-2xl font-bold text-gray-800">+2.4k</span>
                clientes ativos
              </div>
              <div>
                <span className="block text-2xl font-bold text-gray-800">18%</span>
                aumento de retenção
              </div>
              <div>
                <span className="block text-2xl font-bold text-gray-800">24h</span>
                gestão em tempo real
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-gray-200 bg-white/80 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm">
            <div className="rounded-[1.5rem] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 p-6 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-300">Saldo atual</p>
                  <h2 className="mt-2 text-4xl font-bold">185</h2>
                </div>
                <div className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium">BLP</div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="rounded-2xl bg-white/5 p-4">
                  <div className="flex items-center justify-between text-sm text-gray-300">
                    <span>Categoria</span>
                    <span>Ouro</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <div className="flex items-center justify-between text-sm text-gray-300">
                    <span>Próxima recompensa</span>
                    <span>75 pts</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <div className="flex items-center justify-between text-sm text-gray-300">
                    <span>Último atendimento</span>
                    <span>Hoje</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <section className="mt-20 grid gap-6 md:grid-cols-3">
          {[
            { title: 'Pontos por serviço', text: 'Cada visita gera pontos automaticamente e sua carteira digital acompanha o valor real do atendimento.' },
            { title: 'Recompensas exclusivas', text: 'Descontos, serviços gratuitos e benefícios personalizados para fidelizar clientes de forma simples.' },
            { title: 'Gestão em tempo real', text: 'Funcionários e administração acompanham cadastro, histórico e evolução de clientes com praticidade.' }
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 h-12 w-12 rounded-xl bg-gradient-to-br from-gray-800 to-gray-600"></div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
