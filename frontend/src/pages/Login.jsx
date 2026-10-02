import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const { login, registrar, erro, setErro } = useContext(AuthContext);
  const [tipoUsuario, setTipoUsuario] = useState('cliente');
  const [modo, setModo] = useState('login');
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
    nome: '',
    telefone: ''
  });
  const [carregando, setCarregando] = useState(false);

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

      window.location.href = resultado.tipo_usuario === 'cliente' ? '/dashboard-cliente' : '/dashboard-funcionario';
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
      await registrar(formData.nome, formData.email, formData.senha, formData.telefone);
      setErro(null);
      await login(formData.email, formData.senha);
      window.location.href = '/dashboard-cliente';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-150 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Elementos decorativos - Esferas flutuantes */}
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-gradient-to-b from-gray-200 to-gray-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-gradient-to-t from-gray-300 to-gray-200 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-float" style={{ animationDelay: '3s' }}></div>
      <div className="absolute top-1/2 right-0 w-72 h-72 bg-gradient-to-l from-gray-200 to-gray-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

      {/* Linhas decorativas finas */}
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

      {/* Container Principal */}
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Lado Esquerdo - Branding */}
          <div className="hidden lg:flex flex-col justify-center items-start space-y-8 pl-8">
            <div className="space-y-6">
              <div className="inline-block">
                <div className="text-6xl font-light tracking-wider text-gray-800 mb-2">
                  BELLA<span className="font-bold">CHAIN</span>
                </div>
                <div className="h-1 w-32 bg-gradient-to-r from-gray-600 to-gray-300 rounded-full"></div>
              </div>
            </div>

            <div className="space-y-4 max-w-lg">
              <p className="text-xl font-light text-gray-700 leading-relaxed tracking-tight">
                Realçando a sua melhor versão todos os dias
              </p>
              <p className="text-sm font-light text-gray-500 leading-relaxed">
                Um sistema inovador que transforma sua experiência em uma jornada de beleza, bem-estar e recompensas. Cada visita conta, cada momento é valorizado.
              </p>
            </div>

            <div className="space-y-4 pt-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-lg">✓</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Ganhe Pontos</p>
                  <p className="text-sm text-gray-500">A cada serviço realizado</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-lg">✓</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Resgate Benefícios</p>
                  <p className="text-sm text-gray-500">Seus pontos em recompensas</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-lg">✓</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Acompanhe Histórico</p>
                  <p className="text-sm text-gray-500">Seu progresso em tempo real</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lado Direito - Formulário */}
          <div className="flex flex-col justify-center">
            {/* Card de Login */}
            <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 p-10 space-y-8">
              
              {/* Header do Card */}
              <div className="space-y-2">
                <h1 className="text-3xl font-light tracking-wide text-gray-900">
                  Bem-vindo
                </h1>
                <p className="text-gray-400 text-sm font-light tracking-wide">
                  Acesse sua conta para continuar
                </p>
              </div>

              {/* Seletor de Tipo de Usuário */}
              <div className="space-y-4">
                <label className="text-xs font-medium text-gray-500 tracking-widest uppercase">
                  Tipo de Usuário
                </label>
                <div className="flex gap-3 bg-gray-50 rounded-2xl p-2">
                  <button
                    onClick={() => {
                      setTipoUsuario('cliente');
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

              {/* Separador */}
              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

              {/* Modo Login/Registro */}
              {tipoUsuario === 'cliente' && (
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
              )}

              {/* Mensagem de Erro */}
              {erro && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                  <p className="text-red-700 text-sm font-medium">{erro}</p>
                </div>
              )}

              {/* Formulário */}
              <form onSubmit={modo === 'login' ? handleLogin : handleRegistro} className="space-y-5">
                {modo === 'registrar' && (
                  <>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2.5 tracking-wide">
                        Nome Completo
                      </label>
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
                      <label className="block text-gray-700 text-sm font-medium mb-2.5 tracking-wide">
                        Telefone
                      </label>
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
                  <label className="block text-gray-700 text-sm font-medium mb-2.5 tracking-wide">
                    Email
                  </label>
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
                  <label className="block text-gray-700 text-sm font-medium mb-2.5 tracking-wide">
                    Senha
                  </label>
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

              {/* Divisor */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs text-gray-400 font-light tracking-widest">OU</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {/* Dados de Teste */}
              <div className="space-y-3">
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

            {/* Footer */}
            <div className="text-center mt-10">
              <p className="text-gray-400 text-xs font-light tracking-widest">
                BELLACHAIN © 2024 | Realçando a sua melhor versão
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Animação CSS customizada */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
