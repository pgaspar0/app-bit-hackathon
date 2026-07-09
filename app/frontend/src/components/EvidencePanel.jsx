import { formatValue } from '../utils/data.js';

function markerColor(value) {
  const v = Number(value);
  if (!Number.isFinite(v)) return '#64748b';
  if (v <= 35) return '#f43f5e';
  if (v <= 60) return '#f59e0b';
  return '#10b981';
}

export default function EvidencePanel({ result, service, selectedRegion, setSelectedRegion }) {
  const top = result?.top_regioes || [];
  const dados = result?.dados || [];

  return (
    <section className="flex flex-col gap-3 sm:gap-4">
      {/* Top regions ranking */}
      <div className="rounded-xl border border-white/[0.06] bg-navy-900/80 p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="size-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21L21 17.25" />
            </svg>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Regiões prioritárias</h3>
          </div>
          <span className="text-[11px] font-medium text-slate-600">{top.length} regiões</span>
        </div>

        <div className="mt-4 space-y-2">
          {top.length ? (
            top.map((item, index) => {
              const isSelected = selectedRegion === item.regiao;
              const color = markerColor(item.valor);
              return (
                <button
                  key={`${item.regiao || 'regiao'}-${index}`}
                  type="button"
                  onClick={() => setSelectedRegion(item.regiao || '')}
                  className={`group w-full rounded-lg border p-3 text-left transition-all ${
                    isSelected
                      ? 'border-white/[0.15] bg-white/[0.06]'
                      : 'border-white/[0.04] bg-white/[0.02] hover:border-white/[0.1] hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-black text-white"
                      style={{ backgroundColor: color }}
                    >
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-white">
                        {item.regiao || 'Região sem nome'}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-slate-500">
                        {item.indicador || service.indicator}
                        {item.municipio ? ` · ${item.municipio}` : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-white">
                        {formatValue(item.valor, item.unidade)}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(4, Math.min(Number(item.valor) || 0, 100))}%`,
                        backgroundColor: color,
                        opacity: isSelected ? 1 : 0.7,
                      }}
                    />
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-600">
                    <svg className="size-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <span>{item.fonte || 'Fonte não informada'}</span>
                    {item.sem_cobertura && (
                      <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-400">sem cobertura</span>
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="py-6 text-center">
              <p className="text-sm text-slate-600">Sem ranking disponível para esta consulta.</p>
            </div>
          )}
        </div>
      </div>

      {/* Data table */}
      <div className="rounded-xl border border-white/[0.06] bg-navy-900/80 p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <svg className="size-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M10.875 12c-.621 0-1.125.504-1.125 1.125M12 12c.621 0 1.125.504 1.125 1.125m0 0v1.5c0 .621-.504 1.125-1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 0c0 .621.504 1.125 1.125 1.125" />
          </svg>
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Dados complementares</h3>
          <span className="ml-auto text-[11px] text-slate-600">{dados.length} registos</span>
        </div>

        <div className="mt-4 max-h-[340px] overflow-auto rounded-lg border border-white/[0.04]">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-navy-800/95 text-left text-[11px] uppercase tracking-wider text-slate-500 backdrop-blur">
              <tr>
                {['Região', 'Indicador', 'Valor', 'Fonte'].map((head) => (
                  <th key={head} className="px-3 py-2.5 font-bold">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {dados.length ? (
                dados.map((item, index) => (
                  <tr
                    key={`${item.regiao || 'linha'}-${index}`}
                    className="transition hover:bg-white/[0.03]"
                  >
                    <td className="px-3 py-2.5 font-semibold text-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full" style={{ backgroundColor: markerColor(item.valor) }} />
                        {item.regiao || 'Sem região'}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-slate-400">{item.indicador || service.indicator}</td>
                    <td className="px-3 py-2.5 font-bold text-white">{formatValue(item.valor, item.unidade)}</td>
                    <td className="px-3 py-2.5 text-slate-500">{item.fonte || 'Não informada'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-3 py-8 text-center text-slate-600">Sem dados complementares.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
