import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function DashboardCliente() {
  const { usuario, token, logout } = useContext(AuthContext);
  const [clienteData, setClienteData] = useState(null);
  const [recompensas, setRecompensas] = useState([]);
  const [atendimentos, setAtendimentos] = useState([]);
  const [currentView, setCurrentView] = useState('home');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!usuario || usuario.tipo !== 'cliente') {
      window.location.href = '/login';
      return;
    }
    carregarDados();
  }, [usuario]);

  const carregarDados = async () => {
    const fallbackCliente = {
      id: usuario?.id || 1,
      nome: usuario?.nome || 'Marina Costa',
      saldo_pontos: 185,
      categoria: 'Ouro',
      total_gasto: 520,
      ultima_visita: '2026-09-23T10:30:00.000Z'
    };

    const fallbackRecompensas = [
      { id: 1, titulo: '10% de desconto', pontos_necessarios: 50, valor_desconto: 10 },
      { id: 2, titulo: 'Hidratação gratuita', pontos_necessarios: 120 },
      { id: 3, titulo: 'Escova modelada', pontos_necessarios: 80 }
    ];

    const fallbackAtendimentos = [
      { id: 1, servico_nome: 'Coloração', data_atendimento: '2026-09-23T10:30:00.000Z', pontos_gerados: 15, valor_servico: 120 },
      { id: 2, servico_nome: 'Hidratação', data_atendimento: '2026-09-20T15:00:00.000Z', pontos_gerados: 10, valor_servico: 80 },
      { id: 3, servico_nome: 'Escova', data_atendimento: '2026-09-18T11:00:00.000Z', pontos_gerados: 8, valor_servico: 50 }
    ];

    try {
      setCarregando(true);
      
      // Buscar dados do cliente
      const clienteRes = await fetch(`${API_URL}/clientes/meu-perfil`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (clienteRes.ok) {
        setClienteData(await clienteRes.json());
      } else {
        setClienteData(fallbackCliente);
      }

      // Buscar recompensas
      const recompensasRes = await fetch(`${API_URL}/recompensas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (recompensasRes.ok) {
        setRecompensas(await recompensasRes.json());
      } else {
        setRecompensas(fallbackRecompensas);
      }

      // Buscar atendimentos
      const atendimentosRes = await fetch(`${API_URL}/atendimentos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (atendimentosRes.ok) {
        setAtendimentos(await atendimentosRes.json());
      } else {
        setAtendimentos(fallbackAtendimentos);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setClienteData(fallbackCliente);
      setRecompensas(fallbackRecompensas);
      setAtendimentos(fallbackAtendimentos);
    } finally {
      setCarregando(false);
    }
  };

  const handleResgate = async (recompensaId) => {
    try {
      const response = await fetch(`${API_URL}/recompensas/resgatar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          cliente_id: clienteData.id,
          recompensa_id: recompensaId
        })
      });

      if (response.ok) {
        const resultado = await response.json();
        alert(`✅ Recompensa resgatada!\nCódigo: ${resultado.codigo_resgate}`);
        carregarDados();
      } else {
        const erro = await response.json();
        alert(`❌ ${erro.message}`);
      }
    } catch (error) {
      alert('Erro ao resgatar recompensa');
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">BellaChain</h1>
            <p className="text-purple-100 text-sm">Portal do Cliente</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-purple-100">Bem-vindo!</p>
              <p className="font-bold text-lg">{usuario?.nome}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white text-purple-600 px-6 py-2 rounded-lg font-bold hover:bg-purple-50 transition-all"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 flex gap-8">
          <button
            onClick={() => setCurrentView('home')}
            className={`py-4 px-2 font-bold border-b-4 transition-all ${
              currentView === 'home'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            🏠 Início
          </button>
          <button
            onClick={() => setCurrentView('recompensas')}
            className={`py-4 px-2 font-bold border-b-4 transition-all ${
              currentView === 'recompensas'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            🎁 Recompensas
          </button>
          <button
            onClick={() => setCurrentView('historico')}
            className={`py-4 px-2 font-bold border-b-4 transition-all ${
              currentView === 'historico'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 Histórico
          </button>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-4 pt-3"><a href="/pacotes" className="font-bold text-purple-700 hover:text-purple-900">Pacotes e carteira Solana →</a></div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentView === 'home' && (
          <div className="space-y-6">
            {/* Resumo de Pontos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-xl p-6 shadow-lg">
                <p className="text-purple-100 text-sm mb-2">Saldo Atual</p>
                <h2 className="text-4xl font-bold mb-4">{clienteData?.saldo_pontos || 0}</h2>
                <p className="text-purple-100">BLP Disponíveis</p>
              </div>

              <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-xl p-6 shadow-lg">
                <p className="text-pink-100 text-sm mb-2">Categoria</p>
                <h2 className="text-4xl font-bold mb-4">{clienteData?.categoria || 'Bronze'}</h2>
                <p className="text-pink-100">Nível de Cliente</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
                <p className="text-orange-100 text-sm mb-2">Total Gasto</p>
                <h2 className="text-4xl font-bold mb-4">R$ {(clienteData?.total_gasto || 0).toFixed(2)}</h2>
                <p className="text-orange-100">Valor investido</p>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Ações Rápidas</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setCurrentView('recompensas')}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4 rounded-lg font-bold hover:shadow-lg transition-all"
                >
                  🎁 Ver Recompensas
                </button>
                <button
                  onClick={() => setCurrentView('historico')}
                  className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-4 rounded-lg font-bold hover:shadow-lg transition-all"
                >
                  📊 Ver Histórico
                </button>
                <button
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-lg font-bold hover:shadow-lg transition-all"
                >
                  💳 Meu Perfil
                </button>
              </div>
            </div>

            {/* Últimos Atendimentos */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Últimos Atendimentos</h3>
              <div className="space-y-3">
                {atendimentos.slice(0, 5).map(atendimento => (
                  <div key={atendimento.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                    <div>
                      <p className="font-bold text-gray-800">{atendimento.servico_nome}</p>
                      <p className="text-sm text-gray-600">{new Date(atendimento.data_atendimento).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-600">+{atendimento.pontos_gerados} BLP</p>
                      <p className="text-sm text-gray-600">R$ {atendimento.valor_servico.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentView === 'recompensas' && (
          <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Catálogo de Recompensas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recompensas.map(recompensa => (
                <div key={recompensa.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{recompensa.titulo}</h3>
                    <p className="text-gray-600 text-sm mt-2">{recompensa.descricao}</p>
                  </div>

                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 mb-4">
                    <p className="text-center">
                      <span className="text-3xl font-bold text-purple-600">{recompensa.pontos_necessarios}</span>
                      <span className="text-gray-600 ml-2">BLP</span>
                    </p>
                  </div>

                  <button
                    onClick={() => handleResgate(recompensa.id)}
                    disabled={!clienteData || clienteData.saldo_pontos < recompensa.pontos_necessarios}
                    className={`w-full py-3 rounded-lg font-bold transition-all ${
                      clienteData && clienteData.saldo_pontos >= recompensa.pontos_necessarios
                        ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:shadow-lg'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {clienteData && clienteData.saldo_pontos >= recompensa.pontos_necessarios
                      ? 'Resgatar'
                      : 'Saldo Insuficiente'}
                  </button>

                  <p className="text-center text-xs text-gray-500 mt-2">
                    Tipo: {recompensa.tipo}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'historico' && (
          <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Histórico de Transações</h2>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-600 to-pink-500 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold">Data</th>
                    <th className="px-6 py-4 text-left font-bold">Serviço/Descrição</th>
                    <th className="px-6 py-4 text-left font-bold">Tipo</th>
                    <th className="px-6 py-4 text-right font-bold">Pontos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {atendimentos.map(atendimento => (
                    <tr key={atendimento.id} className="hover:bg-gray-50 transition-all">
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(atendimento.data_atendimento).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-gray-800 font-semibold">
                        {atendimento.servico_nome}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
                          ENTRADA
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-green-600">
                        +{atendimento.pontos_gerados}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
