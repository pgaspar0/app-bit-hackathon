import { PRIORITY_STATES, SUGGESTED_QUERIES } from '../config/product.js';
import { fetchDados } from '../services/dadosApi.js';
import { makeMockResult, uniqueRegions } from '../utils/data.js';

function PriorityBadge({ priority }) {
  const state = PRIORITY_STATES[priority || 'SEM_DADOS'] || PRIORITY_STATES.SEM_DADOS;
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${state.tone}`}>
      {state.label}
    </span>
  );
}

function DecisionBox({ result }) {
  return (
    <div className="rounded-lg border border-slate-900 bg-slate-950 p-5 text-white shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
        Recomendação para decisão pública
      </p>
      <p className="mt-3 text-xl font-black leading-8">{result.recomendacao}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {(result.fontes || []).map((source) => (
          <span
            key={source}
            className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200"
          >
            {source}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function SidebarConsulta({
  service,
  query,
  setQuery,
  selectedRegion,
  setSelectedRegion,
  result,
  setResult,
  status,
  setStatus,
  error,
  setError,
  catalog,
  idioma,
}) {
  const catalogRegions = Array.isArray(catalog?.regioes)
    ? catalog.regioes.map((region) => region.cluster_code).filter(Boolean)
    : [];
  const regions = catalogRegions.length ? catalogRegions : uniqueRegions(result);

  async function handleSubmit(event) {
    event?.preventDefault();
    if (!query.trim()) return;

    setStatus('loading');
    setError('');

    try {
      const nextResult = await fetchDados({
        consulta: query.trim(),
        filtros: {
          regiao: selectedRegion || null,
          indicador: service.backendIndicator || null,
          servico: service.id,
        },
        idioma,
        serviceId: service.id,
      });
      setResult(nextResult);
      setStatus('success');
    } catch (err) {
      setResult(makeMockResult(service.id));
      setStatus('success');
      setError('Não foi possível contactar POST /dados nesta execução. A UI está a usar fallback temporário no mesmo contrato do backend.');
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Consulta IA</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">Faça a pergunta que orienta a decisão</h2>
          </div>
          <span className="rounded-full px-3 py-1 text-xs font-bold text-white" style={{ backgroundColor: service.accent }}>
            {service.short}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <textarea
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            rows={4}
            placeholder={service.queryHint}
            className="w-full resize-none rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base text-slate-950 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
          />

          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={selectedRegion}
              onChange={(event) => setSelectedRegion(event.target.value)}
              className="min-h-11 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-slate-900"
            >
              <option value="">Todas as regiões disponíveis</option>
              {regions.map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>

            <button
              type="submit"
              disabled={status === 'loading' || !query.trim()}
              className="min-h-11 rounded-md bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === 'loading' ? 'A analisar evidência...' : 'Gerar recomendação'}
            </button>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {[service.queryHint, ...SUGGESTED_QUERIES].filter(Boolean).map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setQuery(suggestion)}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:bg-white"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
          {error}
        </div>
      )}

      {status === 'idle' && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-bold text-slate-500">Aguardando consulta</p>
          <p className="mt-2 text-sm text-slate-500">
            Depois da pergunta, esta área mostra resumo executivo, evidência, prioridade, fontes e recomendação.
          </p>
        </div>
      )}

      {status === 'loading' && (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto size-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-950" />
          <p className="mt-4 text-sm font-bold text-slate-600">A cruzar pergunta, indicadores e território...</p>
        </div>
      )}

      {result && status === 'success' && (
        <div className="soft-in space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <PriorityBadge priority={result.prioridade_intervencao} />
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Resposta estruturada
              </span>
            </div>

            <h3 className="mt-4 text-sm font-black uppercase tracking-[0.16em] text-slate-500">Resumo executivo</h3>
            <p className="mt-2 text-lg font-semibold leading-8 text-slate-950">{result.resumo_executivo}</p>

            <h3 className="mt-5 text-sm font-black uppercase tracking-[0.16em] text-slate-500">Resposta IA</h3>
            <p className="mt-2 text-sm leading-7 text-slate-700">{result.resposta_ia}</p>
          </div>

          <DecisionBox result={result} />
        </div>
      )}
    </section>
  );
}
