import { SERVICES } from '../config/product.js';
import { formatValue } from '../utils/data.js';
import EvidencePanel from './EvidencePanel.jsx';
import MapaInterativo from './MapaInterativo.jsx';
import SidebarConsulta from './SidebarConsulta.jsx';

function Header({ service, result, status, idioma, setIdioma, catalogStatus }) {
  const stats = result?.estatisticas;
  const idiomas = ['pt', 'en', 'es'];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 text-white backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-md border border-white/15 bg-white text-lg font-black text-slate-950">
              BiT
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide text-white">Decisão pública baseada em dados</p>
              <p className="text-xs text-slate-400">Pergunta - evidência - território - recomendação</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs sm:flex sm:items-center">
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-emerald-100">
              {status === 'success' ? 'Dataset consultado' : 'Dataset pronto'}
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-slate-200">
              Catálogo: {catalogStatus === 'success' ? 'API' : 'fallback'}
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-slate-200">
              {stats?.total_regioes ?? 0} regiões no contexto
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-slate-200">
              Serviço: {service.label}
            </span>
            <span className="flex rounded-full border border-white/15 bg-white/5 p-0.5">
              {idiomas.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setIdioma(item)}
                  className={`rounded-full px-2.5 py-1 font-bold uppercase transition ${
                    idioma === item ? 'bg-white text-slate-950' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {item}
                </button>
              ))}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

function ServiceNav({ active, onChange }) {
  return (
    <nav className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
      <div className="flex gap-2 overflow-x-auto rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
        {SERVICES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`min-h-11 shrink-0 rounded-md px-4 text-left text-sm font-semibold transition ${
              active === item.id ? 'text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
            }`}
            style={active === item.id ? { backgroundColor: item.accent } : undefined}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

function Hero({ service }) {
  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
      <div className="rounded-lg bg-white p-6 shadow-panel ring-1 ring-slate-200 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Sistema de apoio à decisão</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
          Transformar perguntas públicas em decisões territoriais claras.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          O BiT liga linguagem natural, evidência estatística e leitura geográfica para apoiar políticas públicas
          com rastreabilidade e foco na ação.
        </p>
        <div className="mt-6 grid gap-2 text-sm font-semibold text-slate-700 sm:grid-cols-4">
          {['Pergunta', 'Evidência', 'Território', 'Decisão'].map((step, index) => (
            <div key={step} className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <span className="flex size-6 items-center justify-center rounded bg-slate-950 text-xs text-white">
                {index + 1}
              </span>
              {step}
            </div>
          ))}
        </div>
      </div>

      <aside className="rounded-lg border border-slate-800 bg-slate-900 p-6 text-white shadow-panel">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Contexto atual</p>
        <h2 className="mt-3 text-2xl font-black">{service.label}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          A camada de análise está preparada para novas regiões, fontes, indicadores e observações sem depender de
          uma geografia fixa.
        </p>
        <div className="mt-5 rounded-md border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-slate-400">Indicador-guia</p>
          <p className="mt-1 text-lg font-bold">{service.indicator}</p>
        </div>
      </aside>
    </section>
  );
}

function MetricsStrip({ result }) {
  const stats = result?.estatisticas || {};
  const cards = [
    ['Registos', stats.total_registros],
    ['Regiões', stats.total_regioes],
    ['Valor médio', formatValue(stats.valor_medio)],
    ['Mínimo', formatValue(stats.valor_minimo)],
    ['Máximo', formatValue(stats.valor_maximo)],
    ['Região destaque', stats.regiao_destaque || 'Sem destaque'],
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-5 sm:px-6 lg:px-8">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-2 truncate text-2xl font-black text-slate-950">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function DashboardLayout(props) {
  const {
    service,
    serviceId,
    setServiceId,
    result,
    status,
    idioma,
    setIdioma,
    selectedRegion,
    setSelectedRegion,
    catalogStatus,
    mapRegions,
  } = props;

  return (
    <div className="min-h-screen bg-slate-100">
      <Header
        service={service}
        result={result}
        status={status}
        idioma={idioma}
        setIdioma={setIdioma}
        catalogStatus={catalogStatus}
      />
      <ServiceNav active={serviceId} onChange={setServiceId} />
      <Hero service={service} />
      <MetricsStrip result={result} />

      <main className="mx-auto grid max-w-7xl gap-5 px-4 pb-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.92fr)] lg:px-8">
        <div className="space-y-5">
          <SidebarConsulta {...props} />
          <EvidencePanel
            result={result}
            service={service}
            selectedRegion={selectedRegion}
            setSelectedRegion={setSelectedRegion}
          />
        </div>

        <MapaInterativo
          result={result}
          service={service}
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
          mapRegions={mapRegions}
        />
      </main>
    </div>
  );
}
