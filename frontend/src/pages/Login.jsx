import React, { useState, useContext, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function Login() {
  const { login, registrar, erro, setErro } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const tipoInicial = searchParams.get('tipo') === 'funcionario' ? 'funcionario' : 'cliente';
  const [tipoUsuario, setTipoUsuario] = useState(tipoInicial);
  const [modo, setModo] = useState('login');
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
    nome: '',
    telefone: ''
  });
  const [carregando, setCarregando] = useState(false);
  const [recuperacaoAtiva, setRecuperacaoAtiva] = useState(false);
  const [recuperacaoEmail, setRecuperacaoEmail] = useState('');
  const [recuperacaoToken, setRecuperacaoToken] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [recuperacaoMensagem, setRecuperacaoMensagem] = useState('');
  const [recuperacaoErro, setRecuperacaoErro] = useState('');

  useEffect(() => {
    const tipo = searchParams.get('tipo') === 'funcionario' ? 'funcionario' : 'cliente';
    setTipoUsuario(tipo);
    setErro(null);
    setFormData({ email: '', senha: '', nome: '', telefone: '' });
  }, [searchParams, setErro]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro(null);

    try {
      const resultado = await login(formData.email, formData.senha);

      if (tipoUsuario === 'cliente' && resultado.tipo_usuario !== 'cliente') {
        throw new Error('Este email é de um funcionário. Use o login de funcionário.');
      }
      if (tipoUsuario === 'funcionario' && resultado.tipo_usuario !== 'funcionario' && resultado.tipo_usuario !== 'admin') {
        throw new Error('Este email é de um cliente. Use o login de cliente.');
      }

      if (resultado.tipo_usuario === 'cliente') {
        window.location.href = '/dashboard-cliente';
      } else if (resultado.tipo_usuario === 'admin') {
        window.location.href = '/dashboard-admin';
      } else {
        window.location.href = '/dashboard-funcionario';
      }
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro(null);

    try {
      const tipoCadastro = tipoUsuario === 'funcionario' ? 'funcionario' : 'cliente';
      await registrar(formData.nome, formData.email, formData.senha, formData.telefone, tipoCadastro);
      const resultadoLogin = await login(formData.email, formData.senha);

      if (tipoCadastro === 'funcionario' && resultadoLogin.tipo_usuario !== 'funcionario' && resultadoLogin.tipo_usuario !== 'admin') {
        throw new Error('Não foi possível concluir o cadastro de funcionário.');
      }

      window.location.href = tipoCadastro === 'funcionario' ? '/dashboard-funcionario' : '/dashboard-cliente';
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  };

  const dados_teste = {
    cliente: {
      email: 'marina@bellachain.com',
      senha: 'marina123'
    },
    funcionario: {
      email: 'ana@bellachain.com',
      senha: 'ana123'
    }
  };

  const preencherDadosTeste = () => {
    const dados = dados_teste[tipoUsuario];
    setFormData(prev => ({
      ...prev,
      email: dados.email,
      senha: dados.senha
    }));
  };

  const solicitarRecuperacao = async (e) => {
    e.preventDefault();
    setRecuperacaoErro('');
    setRecuperacaoMensagem('');

    try {
      const response = await fetch(`${API_URL}/auth/solicitar-recuperacao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recuperacaoEmail || formData.email })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Não foi possível solicitar a recuperação de senha.');
      }

      setRecuperacaoMensagem(data.message || 'Solicitação enviada com sucesso.');
      if (data.recoveryToken) {
        setRecuperacaoToken(data.recoveryToken);
      }
    } catch (error) {
      setRecuperacaoErro(error.message);
    }
  };

  const redefinirSenha = async (e) => {
    e.preventDefault();
    setRecuperacaoErro('');
    setRecuperacaoMensagem('');

    try {
      const response = await fetch(`${API_URL}/auth/redefinir-senha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: recuperacaoToken, senha_nova: novaSenha })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Não foi possível redefinir a senha.');
      }

      setRecuperacaoMensagem(data.message || 'Senha redefinida com sucesso.');
      setRecuperacaoAtiva(false);
      setRecuperacaoEmail('');
      setRecuperacaoToken('');
      setNovaSenha('');
      setFormData((prev) => ({ ...prev, senha: '' }));
    } catch (error) {
      setRecuperacaoErro(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-150 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-gradient-to-b from-gray-200 to-gray-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-gradient-to-t from-gray-300 to-gray-200 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-float" style={{ animationDelay: '3s' }}></div>
      <div className="absolute top-1/2 right-0 w-72 h-72 bg-gradient-to-l from-gray-200 to-gray-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#888" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <div className="flex justify-center items-center">
          <div className="w-full max-w-xl bg-white/85 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 p-10 space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-light tracking-wide text-gray-900">Bem-vindo</h1>
              <p className="text-gray-400 text-sm font-light tracking-wide">Acesse sua conta para continuar</p>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-medium text-gray-500 tracking-widest uppercase">Tipo de Usuário</label>
              <div className="flex gap-3 bg-gray-50 rounded-2xl p-2">
                <button
                  onClick={() => {
                    setTipoUsuario('cliente');
                    setSearchParams({ tipo: 'cliente' });
                    setModo('login');
                    setErro(null);
                    setFormData({ email: '', senha: '', nome: '', telefone: '' });
                  }}
                  className={`flex-1 py-3 px-6 rounded-xl font-medium text-sm transition-all duration-300 tracking-wide ${
                    tipoUsuario === 'cliente'
                      ? 'bg-white text-gray-900 shadow-lg'
                      : 'text-gray-500 hover:text-gray-700 bg-transparent'
                  }`}
                >
                  Cliente
                </button>
                <button
                  onClick={() => {
                    setTipoUsuario('funcionario');
                    setSearchParams({ tipo: 'funcionario' });
                    setModo('login');
                    setErro(null);
                    setFormData({ email: '', senha: '', nome: '', telefone: '' });
                  }}
                  className={`flex-1 py-3 px-6 rounded-xl font-medium text-sm transition-all duration-300 tracking-wide ${
                    tipoUsuario === 'funcionario'
                      ? 'bg-white text-gray-900 shadow-lg'
                      : 'text-gray-500 hover:text-gray-700 bg-transparent'
                  }`}
                >
                  Funcionário
                </button>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

            <div className="space-y-4">
              <div className="flex gap-3 bg-gray-50 rounded-2xl p-2">
                <button
                  onClick={() => setModo('login')}
                  className={`flex-1 py-3 px-6 rounded-xl font-medium text-sm transition-all duration-300 ${
                    modo === 'login'
                      ? 'bg-white text-gray-900 shadow-md'
                      : 'text-gray-500 hover:text-gray-700 bg-transparent'
                  }`}
                >
                  Entrar
                </button>
                <button
                  onClick={() => setModo('registrar')}
                  className={`flex-1 py-3 px-6 rounded-xl font-medium text-sm transition-all duration-300 ${
                    modo === 'registrar'
                      ? 'bg-white text-gray-900 shadow-md'
                      : 'text-gray-500 hover:text-gray-700 bg-transparent'
                  }`}
                >
                  Registrar
                </button>
              </div>
            </div>

            {erro && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                <p className="text-red-700 text-sm font-medium">{erro}</p>
              </div>
            )}

            <form onSubmit={modo === 'login' ? handleLogin : handleRegistro} className="space-y-5">
              {modo === 'registrar' && (
                <>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2.5 tracking-wide">Nome Completo</label>
                    <input
                      type="text"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      required
                      className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-800 focus:bg-white transition-all duration-300 font-light bg-gray-50"
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2.5 tracking-wide">Telefone</label>
                    <input
                      type="tel"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleChange}
                      className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-800 focus:bg-white transition-all duration-300 font-light bg-gray-50"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2.5 tracking-wide">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-800 focus:bg-white transition-all duration-300 font-light bg-gray-50"
                  placeholder="seu.email@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2.5 tracking-wide">Senha</label>
                <input
                  type="password"
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-800 focus:bg-white transition-all duration-300 font-light bg-gray-50"
                  placeholder="Sua senha segura"
                />
              </div>

              <button
                type="submit"
                disabled={carregando}
                className={`w-full py-4 rounded-xl font-medium text-white transition-all duration-300 mt-8 tracking-wide text-sm uppercase ${
                  carregando
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-900 hover:to-gray-800 shadow-lg hover:shadow-2xl hover:scale-105'
                }`}
              >
                {carregando ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {modo === 'login' ? 'Entrando...' : 'Registrando...'}
                  </span>
                ) : (
                  modo === 'login' ? '✓ Entrar' : '✓ Criar Conta'
                )}
              </button>
            </form>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-xs text-gray-400 font-light tracking-widest">OU</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {recuperacaoAtiva ? (
              <form onSubmit={redefinirSenha} className="space-y-4 border border-gray-200 rounded-2xl p-4 bg-gray-50">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={recuperacaoEmail || formData.email}
                    onChange={(e) => setRecuperacaoEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white"
                    placeholder="Digite seu email"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Token de recuperação</label>
                  <input
                    type="text"
                    value={recuperacaoToken}
                    onChange={(e) => setRecuperacaoToken(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white"
                    placeholder="Cole o token recebido"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Nova senha</label>
                  <input
                    type="password"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white"
                    placeholder="Digite a nova senha"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setRecuperacaoAtiva(false)}
                    className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gray-800 text-white rounded-xl"
                  >
                    Redefinir senha
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={solicitarRecuperacao} className="space-y-4 border border-gray-200 rounded-2xl p-4 bg-gray-50">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Email para recuperação</label>
                  <input
                    type="email"
                    value={recuperacaoEmail || formData.email}
                    onChange={(e) => setRecuperacaoEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white"
                    placeholder="Digite seu email"
                  />
                </div>

                <button type="submit" className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-sm transition-all duration-300 border border-gray-300">
                  Solicitar recuperação de senha
                </button>
              </form>
            )}

            {(recuperacaoMensagem || recuperacaoErro) && (
              <div className={`p-4 rounded-2xl border ${recuperacaoErro ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                <p className={recuperacaoErro ? 'text-red-700 text-sm' : 'text-green-700 text-sm'}>
                  {recuperacaoErro || recuperacaoMensagem}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => setRecuperacaoAtiva((prev) => !prev)}
                type="button"
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-sm transition-all duration-300 border border-gray-300"
              >
                {recuperacaoAtiva ? 'Cancelar recuperação' : 'Esqueci minha senha'}
              </button>
              <button
                onClick={preencherDadosTeste}
                type="button"
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-sm transition-all duration-300 border border-gray-300"
              >
                Usar Credenciais de Teste
              </button>
              <p className="text-center text-gray-500 text-xs font-light tracking-wide">
                {tipoUsuario === 'cliente'
                  ? 'marina@bellachain.com / marina123'
                  : 'ana@bellachain.com / ana123'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
