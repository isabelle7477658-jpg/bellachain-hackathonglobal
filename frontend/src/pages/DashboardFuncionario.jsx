import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function DashboardFuncionario() {
  const { usuario, token, logout } = useContext(AuthContext);
  const isAdmin = usuario?.tipo === 'admin';
  const [currentView, setCurrentView] = useState('registrar');
  const [clientes, setClientes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [atendimentos, setAtendimentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [formData, setFormData] = useState({
    cliente_id: '',
    servico_id: '',
    valor_servico: '',
    descricao: ''
  });
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    if (!usuario || (usuario.tipo !== 'funcionario' && usuario.tipo !== 'admin')) {
      window.location.href = '/login';
      return;
    }
    carregarDados();
  }, [usuario]);

  const carregarDados = async () => {
    const fallbackClientes = [
      { id: 1, nome: 'Marina Costa', saldo_pontos: 185, categoria: 'Ouro' },
      { id: 2, nome: 'Juliana Oliveira', saldo_pontos: 420, categoria: 'Platina' },
      { id: 3, nome: 'Carla Ferreira', saldo_pontos: 75, categoria: 'Prata' }
    ];

    const fallbackServicos = [
      { id: 1, nome: 'Corte de Cabelo', valor: 50, pontos_por_servico: 8 },
      { id: 2, nome: 'Coloração', valor: 120, pontos_por_servico: 15 },
      { id: 3, nome: 'Hidratação', valor: 80, pontos_por_servico: 10 }
    ];

    const fallbackAtendimentos = [
      { id: 1, cliente_nome: 'Marina Costa', servico_nome: 'Coloração', pontos_gerados: 15, valor_servico: 120 },
      { id: 2, cliente_nome: 'Juliana Oliveira', servico_nome: 'Corte de Cabelo', pontos_gerados: 8, valor_servico: 50 }
    ];

    try {
      setCarregando(true);

      // Buscar clientes
      const clientesRes = await fetch(`${API_URL}/clientes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (clientesRes.ok) {
        setClientes(await clientesRes.json());
      } else {
        setClientes(fallbackClientes);
      }

      // Buscar serviços
      const servicosRes = await fetch(`${API_URL}/servicos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (servicosRes.ok) {
        setServicos(await servicosRes.json());
      } else {
        setServicos(fallbackServicos);
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
      setClientes(fallbackClientes);
      setServicos(fallbackServicos);
      setAtendimentos(fallbackAtendimentos);
    } finally {
      setCarregando(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegistrarAtendimento = async (e) => {
    e.preventDefault();
    setMensagem('');

    if (!formData.cliente_id || !formData.servico_id) {
      setMensagem('❌ Selecione um cliente e um serviço');
      return;
    }

    try {
      const valor = formData.valor_servico || 
        servicos.find(s => s.id === parseInt(formData.servico_id))?.valor;

      const response = await fetch(`${API_URL}/atendimentos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          cliente_id: parseInt(formData.cliente_id),
          funcionario_id: usuario.id,
          servico_id: parseInt(formData.servico_id),
          valor_servico: parseFloat(valor),
          descricao: formData.descricao
        })
      });

      if (response.ok) {
        const resultado = await response.json();
        setMensagem(`✅ Atendimento registrado com sucesso! +${resultado.pontos_gerados} BLP`);
        setFormData({ cliente_id: '', servico_id: '', valor_servico: '', descricao: '' });
        carregarDados();
        setTimeout(() => setMensagem(''), 3000);
      } else {
        const erro = await response.json();
        setMensagem(`❌ ${erro.message}`);
      }
    } catch (error) {
      setMensagem('❌ Erro ao registrar atendimento');
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  const servicoSelecionado = formData.servico_id 
    ? servicos.find(s => s.id === parseInt(formData.servico_id))
    : null;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">BellaChain</h1>
            <p className="text-pink-100 text-sm">{isAdmin ? 'Painel de Administração' : 'Painel Funcionário'}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-pink-100">Bem-vindo!</p>
              <p className="font-bold text-lg">{usuario?.nome}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white text-pink-500 px-6 py-2 rounded-lg font-bold hover:bg-pink-50 transition-all"
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
            onClick={() => setCurrentView('registrar')}
            className={`py-4 px-2 font-bold border-b-4 transition-all ${
              currentView === 'registrar'
                ? 'border-pink-500 text-pink-500'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            ✅ Registrar Atendimento
          </button>
          <button
            onClick={() => setCurrentView('historico')}
            className={`py-4 px-2 font-bold border-b-4 transition-all ${
              currentView === 'historico'
                ? 'border-pink-500 text-pink-500'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            📋 Histórico
          </button>
          <button
            onClick={() => setCurrentView('clientes')}
            className={`py-4 px-2 font-bold border-b-4 transition-all ${
              currentView === 'clientes'
                ? 'border-pink-500 text-pink-500'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            👥 Clientes
          </button>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-4 pt-3"><a href="/pacotes" className="font-bold text-pink-700 hover:text-pink-900">Pacotes Solana →</a></div>

      {isAdmin && (
        <div className="max-w-7xl mx-auto px-4 pt-6">
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
            Acesso administrativo ativo: você pode gerenciar clientes, serviços e atendimentos.
          </div>
        </div>
      )}

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentView === 'registrar' && (
          <div>
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl">
              <h2 className="text-3xl font-bold mb-6 text-gray-800">Registrar Novo Atendimento</h2>

              {mensagem && (
                <div className={`mb-6 p-4 rounded-lg ${
                  mensagem.includes('✅') 
                    ? 'bg-green-50 border-l-4 border-green-500 text-green-700'
                    : 'bg-red-50 border-l-4 border-red-500 text-red-700'
                }`}>
                  <p className="font-semibold">{mensagem}</p>
                </div>
              )}

              <form onSubmit={handleRegistrarAtendimento} className="space-y-6">
                {/* Seleção de Cliente */}
                <div>
                  <label className="block text-gray-700 font-bold mb-3">Selecione o Cliente</label>
                  <select
                    name="cliente_id"
                    value={formData.cliente_id}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
                  >
                    <option value="">-- Escolha um cliente --</option>
                    {clientes.map(cliente => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome} - {cliente.saldo_pontos} BLP - {cliente.categoria}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Seleção de Serviço */}
                <div>
                  <label className="block text-gray-700 font-bold mb-3">Selecione o Serviço</label>
                  <select
                    name="servico_id"
                    value={formData.servico_id}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
                  >
                    <option value="">-- Escolha um serviço --</option>
                    {servicos.map(servico => (
                      <option key={servico.id} value={servico.id}>
                        {servico.nome} - R$ {servico.valor.toFixed(2)} ({servico.pontos_por_servico} BLP)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Informações do Serviço Selecionado */}
                {servicoSelecionado && (
                  <div className="bg-gradient-to-r from-pink-100 to-red-100 rounded-lg p-4">
                    <h3 className="font-bold text-gray-800 mb-2">Detalhes do Serviço</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-gray-600 text-sm">Valor</p>
                        <p className="text-xl font-bold text-pink-600">R$ {servicoSelecionado.valor.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Pontos</p>
                        <p className="text-xl font-bold text-pink-600">+{servicoSelecionado.pontos_por_servico} BLP</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Categoria</p>
                        <p className="text-xl font-bold text-pink-600">{servicoSelecionado.categoria}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Valor (opcional - usa padrão do serviço) */}
                <div>
                  <label className="block text-gray-700 font-bold mb-3">Valor (opcional)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-600 font-bold">R$</span>
                    <input
                      type="number"
                      name="valor_servico"
                      value={formData.valor_servico}
                      onChange={handleChange}
                      step="0.01"
                      placeholder={servicoSelecionado?.valor.toFixed(2) || '0.00'}
                      className="w-full px-4 py-3 pl-10 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
                    />
                  </div>
                  <p className="text-gray-500 text-sm mt-2">
                    {servicoSelecionado 
                      ? `Padrão: R$ ${servicoSelecionado.valor.toFixed(2)}`
                      : 'Será usado o valor padrão do serviço'}
                  </p>
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-gray-700 font-bold mb-3">Descrição (opcional)</label>
                  <textarea
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Ex: Corte com franja, coloração loiro..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
                  />
                </div>

                {/* Botão Submit */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all"
                >
                  ✅ Registrar Atendimento
                </button>
              </form>
            </div>
          </div>
        )}

        {currentView === 'historico' && (
          <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Histórico de Atendimentos</h2>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-pink-500 to-red-500 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold">Data</th>
                    <th className="px-6 py-4 text-left font-bold">Cliente</th>
                    <th className="px-6 py-4 text-left font-bold">Serviço</th>
                    <th className="px-6 py-4 text-left font-bold">Valor</th>
                    <th className="px-6 py-4 text-left font-bold">Pontos</th>
                    <th className="px-6 py-4 text-left font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {atendimentos.map(atendimento => (
                    <tr key={atendimento.id} className="hover:bg-gray-50 transition-all">
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(atendimento.data_atendimento).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        {atendimento.cliente_nome}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {atendimento.servico_nome}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-800">
                        R$ {atendimento.valor_servico.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 font-bold text-green-600">
                        +{atendimento.pontos_gerados}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
                          {atendimento.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentView === 'clientes' && (
          <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Lista de Clientes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clientes.map(cliente => (
                <div key={cliente.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{cliente.nome}</h3>
                    <p className="text-gray-600 text-sm">{cliente.email}</p>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Saldo:</span>
                      <span className="text-2xl font-bold text-purple-600">{cliente.saldo_pontos} BLP</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Categoria:</span>
                      <span className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 py-1 rounded-full font-bold text-sm">
                        {cliente.categoria}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Gasto:</span>
                      <span className="font-bold text-gray-800">R$ {cliente.total_gasto.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      📞 {cliente.telefone || 'Sem telefone'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
