import { useState } from 'react';
import { PRIORITY_STATES, SUGGESTED_QUERIES } from '../config/product.js';
import { fetchDados } from '../services/dadosApi.js';
import { makeMockResult, uniqueRegions } from '../utils/data.js';

function PriorityBadge({ priority, large }) {
  const state = PRIORITY_STATES[priority || 'SEM_DADOS'] || PRIORITY_STATES.SEM_DADOS;
  if (large) {
    return (
      <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ backgroundColor: state.bgColor }}>
        <span className="size-2.5 rounded-full" style={{ backgroundColor: state.color }} />
        <span className="text-sm font-bold" style={{ color: state.color }}>{state.label}</span>
      </div>
    );
  }
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${state.tone}`}>
      {state.label}
    </span>
  );
}

function LoadingSteps() {
  const steps = [
    'A cruzar indicadores com o território...',
    'A analisar padrões de concentração...',
    'A gerar recomendação de acção...',
  ];
  const [active, setActive] = useState(0);

  useState(() => {
    const t1 = setTimeout(() => setActive(1), 1200);
    const t2 = setTimeout(() => setActive(2), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  });

  return (
    <div className="rounded-xl border border-white/[0.06] bg-navy-900/80 p-6">
      <div className="flex items-center gap-3">
        <div className="size-5 animate-spin rounded-full border-2 border-slate-700 border-t-teal-400" />
        <p className="text-sm font-bold text-white">A processar consulta...</p>
      </div>
      <div className="mt-5 space-y-3">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center gap-3">
            <div className={`flex size-5 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-500 ${
              i <= active
                ? 'bg-teal-500 text-white'
                : 'border border-slate-700 text-slate-600'
            }`}>
              {i < active ? '✓' : i + 1}
            </div>
            <span className={`text-sm transition-all duration-500 ${
              i <= active ? 'font-medium text-slate-300' : 'text-slate-600'
            }`}>
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIResponseSection({ result, isFallback }) {
  const [expanded, setExpanded] = useState(false);
  const iaText = result.resposta_ia || '';
  const shouldTruncate = iaText.length > 200;

  return (
    <div className="soft-in space-y-3">
      {/* Priority + source indicator */}
      <div className="flex flex-wrap items-center gap-2">
        <PriorityBadge priority={result.prioridade_intervencao} large />
        {isFallback && (
          <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-400 ring-1 ring-amber-500/20">
            Dados de referência
          </span>
        )}
      </div>

      {/* Executive summary */}
      <div className="rounded-xl border border-white/[0.06] bg-navy-900/80 p-4 sm:p-5">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
          Resumo executivo
        </div>
        <p className="mt-3 text-base font-semibold leading-7 text-white">{result.resumo_executivo}</p>
      </div>

      {/* Recommendation box */}
      <div className="rounded-xl border border-teal-500/20 bg-gradient-to-br from-teal-500/[0.08] to-cyan-500/[0.04] p-4 sm:p-5">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-teal-400">
          <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Recomendação de acção
        </div>
        <p className="mt-3 text-sm font-semibold leading-7 text-slate-200">{result.recomendacao}</p>
      </div>

      {/* AI Response (collapsible) */}
      <div className="rounded-xl border border-white/[0.06] bg-navy-900/60 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            Análise detalhada da IA
          </div>
          {shouldTruncate && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="text-[11px] font-semibold text-teal-400 transition hover:text-teal-300"
            >
              {expanded ? 'Recolher' : 'Expandir'}
            </button>
          )}
        </div>
        <p className={`mt-3 text-sm leading-7 text-slate-400 ${!expanded && shouldTruncate ? 'line-clamp-3' : ''}`}>
          {iaText}
        </p>
      </div>

      {/* Sources */}
      {result.fontes?.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">Fontes:</span>
          {result.fontes.map((source) => (
            <span
              key={source}
              className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-slate-400"
            >
              {source}
            </span>
          ))}
        </div>
      )}
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
  const [isFallback, setIsFallback] = useState(false);

  const catalogRegions = Array.isArray(catalog?.regioes)
    ? catalog.regioes.map((region) => region.cluster_code).filter(Boolean)
    : [];
  const regions = catalogRegions.length ? catalogRegions : uniqueRegions(result);

  async function handleSubmit(event) {
    event?.preventDefault();
    if (!query.trim()) return;

    setStatus('loading');
    setError('');
    setIsFallback(false);

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
      setIsFallback(true);
      setError('O sistema não conseguiu responder neste momento. Os dados apresentados são de referência local.');
    }
  }

  return (
    <section className="flex flex-col gap-3 sm:gap-4">
      {/* Query card */}
      <div className="rounded-xl border border-white/[0.06] bg-navy-900/80 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500">
              <svg className="size-4 text-navy-950" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Consulta inteligente</h2>
              <p className="text-[11px] text-slate-500">Pergunte em linguagem natural sobre o território</p>
            </div>
          </div>
          <span
            className="rounded-md px-2 py-1 text-[11px] font-bold text-white"
            style={{ backgroundColor: service.accent }}
          >
            {service.short}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <textarea
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            rows={3}
            placeholder={service.queryHint}
            className="w-full resize-none rounded-lg border border-white/[0.08] bg-navy-950/60 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition focus:border-teal-500/40 focus:bg-navy-950 focus:ring-2 focus:ring-teal-500/20"
          />

          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={selectedRegion}
              onChange={(event) => setSelectedRegion(event.target.value)}
              className="min-h-[42px] flex-1 rounded-lg border border-white/[0.08] bg-navy-950/60 px-3 text-sm font-medium text-slate-300 outline-none transition focus:border-teal-500/40"
            >
              <option value="">Todas as regiões</option>
              {regions.map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>

            <button
              type="submit"
              disabled={status === 'loading' || !query.trim()}
              className="min-h-[42px] rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 px-5 text-sm font-bold text-navy-950 shadow-lg shadow-teal-500/20 transition hover:shadow-teal-500/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              {status === 'loading' ? 'A analisar...' : 'Gerar recomendação'}
            </button>
          </div>
        </form>

        {/* Suggested queries */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {[service.queryHint, ...SUGGESTED_QUERIES].filter(Boolean).slice(0, 4).map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setQuery(suggestion)}
              className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-slate-500 transition hover:border-white/[0.12] hover:text-slate-300"
            >
              {suggestion.length > 60 ? suggestion.slice(0, 57) + '...' : suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="soft-in flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3">
          <svg className="mt-0.5 size-4 shrink-0 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-sm font-medium text-amber-300/90">{error}</p>
        </div>
      )}

      {/* Idle state */}
      {status === 'idle' && (
        <div className="rounded-xl border border-dashed border-white/[0.08] bg-navy-900/40 p-6 text-center sm:p-8">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-white/[0.04]">
            <svg className="size-6 text-slate-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
          </div>
          <p className="text-sm font-bold text-slate-400">Faça uma pergunta para iniciar a análise</p>
          <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-600">
            A resposta incluirá resumo executivo, prioridade de intervenção, recomendação de acção, dados territoriais e fontes.
          </p>
        </div>
      )}

      {/* Loading state */}
      {status === 'loading' && <LoadingSteps />}

      {/* Results */}
      {result && status === 'success' && (
        <AIResponseSection result={result} isFallback={isFallback} />
      )}
    </section>
  );
}
