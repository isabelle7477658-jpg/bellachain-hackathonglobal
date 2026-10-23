import { useCallback, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { buyPackageOnSolana, publishPackageOnSolana } from '../lib/solanaPackages';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const TOKEN_DECIMALS = import.meta.env.VITE_SOLANA_TOKEN_DECIMALS === undefined
  ? null
  : Number(import.meta.env.VITE_SOLANA_TOKEN_DECIMALS);
const base58Alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function encodeBase58(bytes) {
  let number = 0n;
  for (const byte of bytes) number = (number << 8n) + BigInt(byte);
  const digits = [];
  while (number > 0n) {
    const remainder = Number(number % 58n);
    digits.push(base58Alphabet[remainder]);
    number /= 58n;
  }
  for (const byte of bytes) {
    if (byte !== 0) break;
    digits.push('1');
  }
  return digits.reverse().join('') || '1';
}

function toBaseUnits(value, decimals) {
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 18) return null;
  const normalized = String(value).trim().replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(normalized)) return null;
  const [whole, fraction = ''] = normalized.split('.');
  if (fraction.length > decimals) return null;
  return (BigInt(whole) * (10n ** BigInt(decimals)) + BigInt((fraction + '0'.repeat(decimals)).slice(0, decimals))).toString();
}

async function apiRequest(path, token, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || 'Não foi possível concluir a solicitação.');
  return payload;
}

export default function PacotesPortal() {
  const { usuario, token, logout } = useContext(AuthContext);
  const [wallet, setWallet] = useState(null);
  const [packages, setPackages] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState({ titulo: '', descricao: '', valor: '' });
  const [serviceForm, setServiceForm] = useState({
    nome: '', valor: '', cancelamento_prazo_minutos: '1440',
    cancelamento_tardio_acao: 'devolver', cancelamento_tardio_taxa_bps: '0',
    falta_acao: 'devolver', falta_taxa_bps: '0',
  });
  const isProvider = usuario?.tipo === 'funcionario' || usuario?.tipo === 'admin';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const address = await apiRequest('/carteira-solana/me', token);
      setWallet(address.address);
      setPackages(await apiRequest(isProvider ? '/pacotes/gerenciados' : '/pacotes', token));
      if (isProvider) setServices(await apiRequest('/servicos', token));
      else setPurchases(await apiRequest('/pacotes/compras/meus', token));
    } catch (error) {
      setNotice(error.message);
    } finally {
      setLoading(false);
    }
  }, [isProvider, token]);

  useEffect(() => { load(); }, [load]);

  const linkWallet = async () => {
    setBusy(true);
    setNotice('');
    try {
      const provider = window.phantom?.solana || window.solana;
      if (!provider?.connect || !provider?.signMessage) throw new Error('Instale ou habilite a carteira Phantom para Solana.');
      const connected = await provider.connect();
      const address = connected.publicKey?.toString() || provider.publicKey?.toString();
      if (!address) throw new Error('A carteira não retornou um endereço público.');
      const challenge = await apiRequest('/carteira-solana/challenge', token, {
        method: 'POST', body: JSON.stringify({ address }),
      });
      const signed = await provider.signMessage(new TextEncoder().encode(challenge.message), 'utf8');
      await apiRequest('/carteira-solana/verify', token, {
        method: 'POST', body: JSON.stringify({ address, nonce: challenge.nonce, signature: encodeBase58(signed.signature) }),
      });
      setWallet(address);
      setNotice('Carteira vinculada por assinatura. Nenhuma transferência foi autorizada.');
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusy(false);
    }
  };

  const createPackage = async (event) => {
    event.preventDefault();
    if (!Number.isInteger(TOKEN_DECIMALS) || TOKEN_DECIMALS < 0 || TOKEN_DECIMALS > 18) {
      setNotice('Configure VITE_SOLANA_TOKEN_DECIMALS conforme o mint SPL escolhido.');
      return;
    }
    const amount = toBaseUnits(form.valor, TOKEN_DECIMALS);
    if (!amount) {
      setNotice(`Informe um valor válido com até ${TOKEN_DECIMALS} casas decimais.`);
      return;
    }
    setBusy(true);
    setNotice('');
    try {
      const result = await apiRequest('/pacotes', token, {
        method: 'POST',
        body: JSON.stringify({ titulo: form.titulo, descricao: form.descricao, valor_base_units: amount }),
      });
      setPackages((current) => [result, ...current.filter((item) => item.id !== result.id)]);
      setForm({ titulo: '', descricao: '', valor: '' });
      const chain = await publishPackageOnSolana({ providerWallet: wallet, packageRef: result.id, mintAddress: result.token_mint, priceUnits: result.valor_base_units });
      const published = await apiRequest(`/pacotes/${result.id}/publicacao`, token, {
        method: 'POST', body: JSON.stringify({ assinatura: chain.signature, conta_onchain: chain.packageAddress }),
      });
      setPackages((current) => [published, ...current.filter((item) => item.id !== published.id)]);
      setNotice(published.message);
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusy(false);
    }
  };

  const publishDraft = async (item) => {
    setBusy(true);
    setNotice('');
    try {
      const chain = await publishPackageOnSolana({ providerWallet: wallet, packageRef: item.id, mintAddress: item.token_mint, priceUnits: item.valor_base_units });
      const published = await apiRequest(`/pacotes/${item.id}/publicacao`, token, {
        method: 'POST', body: JSON.stringify({ assinatura: chain.signature, conta_onchain: chain.packageAddress }),
      });
      setPackages((current) => current.map((candidate) => candidate.id === published.id ? { ...candidate, ...published } : candidate));
      setNotice(published.message);
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusy(false);
    }
  };

  const buyPackage = async (item) => {
    if (!wallet) return setNotice('Vincule sua carteira Solana antes de comprar.');
    setBusy(true);
    setNotice('');
    try {
      const purchase = await buyPackageOnSolana({
        customerWallet: wallet,
        packageAddress: item.conta_onchain,
        providerWallet: item.prestador_carteira,
        mintAddress: item.token_mint,
        packageRef: item.id,
        amountUnits: item.valor_base_units,
      });
      const confirmed = await apiRequest('/pacotes/compras/confirmar', token, {
        method: 'POST', body: JSON.stringify({ pacote_id: item.id, assinatura: purchase.signature, conta_compra: purchase.purchaseAddress, purchase_ref: purchase.purchaseRef }),
      });
      setPurchases((current) => [{ ...confirmed, pacote_titulo: item.titulo, prestador_nome: item.prestador_nome }, ...current]);
      setNotice('Compra confirmada na Solana. O crédito permanece no saldo livre da sua carteira inteligente.');
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusy(false);
    }
  };

  const togglePackage = async (item) => {
    setBusy(true);
    try {
      await apiRequest(`/pacotes/${item.id}/ativo`, token, {
        method: 'PATCH', body: JSON.stringify({ ativo: !item.ativo }),
      });
      await load();
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusy(false);
    }
  };

  const createService = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      await apiRequest('/servicos', token, {
        method: 'POST', body: JSON.stringify({ ...serviceForm, pontos_por_servico: 0, categoria: 'Serviço' }),
      });
      setServiceForm({ nome: '', valor: '', cancelamento_prazo_minutos: '1440', cancelamento_tardio_acao: 'devolver', cancelamento_tardio_taxa_bps: '0', falta_acao: 'devolver', falta_taxa_bps: '0' });
      setServices(await apiRequest('/servicos', token));
      setNotice('Serviço cadastrado com a política de cancelamento definida pelo prestador.');
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <main className="min-h-screen grid place-items-center text-gray-600">Carregando sua carteira e pacotes…</main>;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-purple-700 to-pink-600 p-6 text-white shadow">
          <div>
            <p className="text-sm text-purple-100">BellaChain · Solana Devnet</p>
            <h1 className="text-3xl font-bold">{isProvider ? 'Pacotes do prestador' : 'Meus pacotes'}</h1>
            <p className="mt-1 text-purple-100">Crédito flexível: escolha o serviço no momento do agendamento.</p>
          </div>
          <div className="flex gap-3">
            <Link to={isProvider ? '/dashboard-funcionario' : '/dashboard-cliente'} className="rounded-lg bg-white/15 px-4 py-2">Dashboard</Link>
            <button onClick={() => { logout(); window.location.assign('/login'); }} className="rounded-lg bg-white px-4 py-2 font-semibold text-purple-700">Sair</button>
          </div>
        </header>

        {notice && <div role="status" className="rounded-xl border border-purple-200 bg-purple-50 p-4 text-purple-900">{notice}</div>}

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Carteira do cliente</h2>
              <p className="mt-1 text-sm text-gray-600">A vinculação usa uma assinatura de mensagem e não movimenta tokens.</p>
            </div>
            {wallet ? <code className="max-w-full break-all rounded bg-gray-100 px-3 py-2 text-sm">{wallet}</code> : <button disabled={busy} onClick={linkWallet} className="rounded-lg bg-purple-700 px-4 py-2 font-semibold text-white disabled:opacity-50">{busy ? 'Aguardando carteira…' : 'Vincular carteira Solana'}</button>}
          </div>
        </section>

        {isProvider && (
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">Serviços e política de cancelamento</h2>
            <p className="mt-1 text-sm text-gray-600">O prazo e as condições abaixo são copiados para cada reserva. Alterações futuras valem apenas para novos agendamentos.</p>
            <form onSubmit={createService} className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="grid gap-1 text-sm font-medium">Nome do serviço<input required value={serviceForm.nome} onChange={(event) => setServiceForm({ ...serviceForm, nome: event.target.value })} className="rounded-lg border px-3 py-2" /></label>
              <label className="grid gap-1 text-sm font-medium">Preço de referência (R$)<input required type="number" min="0.01" step="0.01" value={serviceForm.valor} onChange={(event) => setServiceForm({ ...serviceForm, valor: event.target.value })} className="rounded-lg border px-3 py-2" /></label>
              <label className="grid gap-1 text-sm font-medium">Cancelar sem taxa até (minutos antes)<input required type="number" min="0" value={serviceForm.cancelamento_prazo_minutos} onChange={(event) => setServiceForm({ ...serviceForm, cancelamento_prazo_minutos: event.target.value })} className="rounded-lg border px-3 py-2" /></label>
              <label className="grid gap-1 text-sm font-medium">Cancelamento fora do prazo<select value={serviceForm.cancelamento_tardio_acao} onChange={(event) => setServiceForm({ ...serviceForm, cancelamento_tardio_acao: event.target.value })} className="rounded-lg border px-3 py-2"><option value="devolver">Devolver o valor</option><option value="cobrar_taxa">Aplicar taxa acordada</option></select></label>
              <label className="grid gap-1 text-sm font-medium">Taxa tardia (basis points; 100 = 1%)<input required type="number" min="0" max="10000" value={serviceForm.cancelamento_tardio_taxa_bps} onChange={(event) => setServiceForm({ ...serviceForm, cancelamento_tardio_taxa_bps: event.target.value })} className="rounded-lg border px-3 py-2" /></label>
              <label className="grid gap-1 text-sm font-medium">Falta do cliente<select value={serviceForm.falta_acao} onChange={(event) => setServiceForm({ ...serviceForm, falta_acao: event.target.value })} className="rounded-lg border px-3 py-2"><option value="devolver">Devolver o valor</option><option value="cobrar_taxa">Aplicar taxa acordada</option></select></label>
              <label className="grid gap-1 text-sm font-medium">Taxa por falta (basis points)<input required type="number" min="0" max="10000" value={serviceForm.falta_taxa_bps} onChange={(event) => setServiceForm({ ...serviceForm, falta_taxa_bps: event.target.value })} className="rounded-lg border px-3 py-2" /></label>
              <button disabled={busy} className="rounded-lg bg-pink-700 px-4 py-3 font-semibold text-white disabled:opacity-50">Cadastrar serviço</button>
            </form>
            <ul className="mt-5 divide-y">{services.map((service) => <li key={service.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><span className="font-medium">{service.nome} · R$ {Number(service.valor).toFixed(2)}</span><span className="text-gray-600">Cancelamento sem taxa até {service.cancelamento_prazo_minutos ?? 1440} min antes</span></li>)}</ul>
          </section>
        )}

        {isProvider && (
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">Criar pacote</h2>
            <p className="mt-1 text-sm text-gray-600">O serviço não é escolhido na venda. O pacote só será exibido após publicação on-chain.</p>
            {!Number.isInteger(TOKEN_DECIMALS) && <p className="mt-2 text-sm text-amber-700">Configure VITE_SOLANA_TOKEN_DECIMALS conforme o mint SPL escolhido.</p>}
            <form onSubmit={createPackage} className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="grid gap-1 text-sm font-medium">Nome do pacote<input required maxLength={120} value={form.titulo} onChange={(event) => setForm({ ...form, titulo: event.target.value })} className="rounded-lg border px-3 py-2" /></label>
              <label className="grid gap-1 text-sm font-medium">Valor no token de pagamento<input required inputMode="decimal" value={form.valor} onChange={(event) => setForm({ ...form, valor: event.target.value })} className="rounded-lg border px-3 py-2" /></label>
              <label className="grid gap-1 text-sm font-medium md:col-span-2">Descrição e condições<textarea value={form.descricao} onChange={(event) => setForm({ ...form, descricao: event.target.value })} rows={3} className="rounded-lg border px-3 py-2" /></label>
              <button disabled={busy || !wallet} className="rounded-lg bg-purple-700 px-4 py-3 font-semibold text-white disabled:opacity-50">Salvar rascunho do pacote</button>
            </form>
          </section>
        )}

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">{isProvider ? 'Pacotes cadastrados' : 'Pacotes disponíveis'}</h2>
          {packages.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-white p-8 text-center text-gray-600">
              {isProvider ? 'Você ainda não cadastrou pacotes.' : 'Ainda não há pacotes publicados na Solana Devnet.'}
            </div>
          ) : packages.map((item) => (
            <article key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm">
              <div>
                <h3 className="font-bold text-gray-900">{item.titulo}</h3>
                <p className="text-sm text-gray-600">{item.descricao || (item.prestador_nome ? `Por ${item.prestador_nome}` : 'Pacote BellaChain')}</p>
                <p className="mt-1 text-xs text-gray-500">{item.publicado ? 'Publicado on-chain' : 'Rascunho · aguardando publicação on-chain'}</p>
              </div>
              {isProvider && !item.publicado && <div className="flex gap-2"><button disabled={busy} onClick={() => publishDraft(item)} className="rounded-lg bg-purple-700 px-4 py-2 text-white">Publicar na Solana</button><button disabled={busy} onClick={() => togglePackage(item)} className="rounded-lg border px-4 py-2">{item.ativo ? 'Desativar' : 'Ativar'}</button></div>}
              {!isProvider && <button disabled={busy || !wallet} onClick={() => buyPackage(item)} className="rounded-lg bg-purple-700 px-4 py-2 font-semibold text-white disabled:opacity-50">Comprar pacote</button>}
            </article>
          ))}
        </section>

        {!isProvider && <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">Créditos comprados</h2>
          {purchases.length === 0 ? <div className="rounded-2xl border border-dashed bg-white p-6 text-gray-600">Suas compras confirmadas aparecerão aqui.</div> : purchases.map((purchase) => <article key={purchase.id} className="rounded-2xl bg-white p-5 shadow-sm"><h3 className="font-bold">{purchase.pacote_titulo}</h3><p className="text-sm text-gray-600">Prestador: {purchase.prestador_nome} · Estado: {purchase.status}</p><p className="mt-2 text-sm">Saldo livre: {purchase.saldo_disponivel_units} unidades mínimas do token</p><p className="text-sm">Saldo reservado: {purchase.saldo_reservado_units} unidades mínimas do token</p></article>)}</section>}

        <p className="text-xs leading-relaxed text-gray-500">Compra e publicação são assinadas pela carteira conectada e confirmadas pela RPC antes do banco registrar o resultado. Reserva, cancelamento e liquidação bilateral ainda não estão conectados à interface.</p>
      </div>
    </main>
  );
}
