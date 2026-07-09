import { formatValue } from '../utils/data.js';

export default function EvidencePanel({ result, service, selectedRegion, setSelectedRegion }) {
  const top = result?.top_regioes || [];
  const dados = result?.dados || [];

  return (
    <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-[0.16em] text-slate-500">Regiões prioritárias</h3>
        <div className="mt-4 space-y-3">
          {top.length ? (
            top.map((item, index) => (
              <button
                key={`${item.regiao || 'regiao'}-${index}`}
                type="button"
                onClick={() => setSelectedRegion(item.regiao || '')}
                className={`w-full rounded-md border p-3 text-left transition ${
                  selectedRegion === item.regiao ? 'border-slate-950 bg-slate-50' : 'border-slate-200 hover:border-slate-400'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-950">
                      {index + 1}. {item.regiao || 'Região sem nome'}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">{item.indicador || service.indicator}</p>
                  </div>
                  <span className="rounded bg-slate-950 px-2 py-1 text-xs font-black text-white">
                    {formatValue(item.valor, item.unidade)}
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(4, Math.min(Number(item.valor) || 0, 100))}%`,
                      backgroundColor: service.accent,
                    }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {item.fonte || 'Fonte não informada'}
                  {item.sem_cobertura ? ' · sem cobertura' : ''}
                </p>
              </button>
            ))
          ) : (
            <p className="text-sm text-slate-500">Sem ranking disponível para esta consulta.</p>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-[0.16em] text-slate-500">Dados complementares</h3>
        <div className="mt-4 max-h-[360px] overflow-auto rounded-md border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="sticky top-0 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                {['Região', 'Indicador', 'Valor', 'Fonte'].map((head) => (
                  <th key={head} className="px-3 py-3 font-black">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {dados.length ? (
                dados.map((item, index) => (
                  <tr key={`${item.regiao || 'linha'}-${index}`} className="hover:bg-slate-50">
                    <td className="px-3 py-3 font-semibold text-slate-900">{item.regiao || 'Sem região'}</td>
                    <td className="px-3 py-3 text-slate-600">{item.indicador || service.indicator}</td>
                    <td className="px-3 py-3 font-black text-slate-950">{formatValue(item.valor, item.unidade)}</td>
                    <td className="px-3 py-3 text-slate-500">{item.fonte || 'Não informada'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-3 py-8 text-center text-slate-500">Sem dados complementares.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
