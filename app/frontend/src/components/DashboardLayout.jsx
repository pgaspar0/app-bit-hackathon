import { SERVICES, PRIORITY_STATES } from '../config/product.js';
import { formatValue } from '../utils/data.js';
import EvidencePanel from './EvidencePanel.jsx';
import MapaInterativo from './MapaInterativo.jsx';
import SidebarConsulta from './SidebarConsulta.jsx';

function ServiceIcon({ path, size = 18 }) {
  return (
    <svg className="shrink-0" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

function Header({ service, idioma, setIdioma, catalogStatus }) {
  const idiomas = ['pt', 'en', 'es'];

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-navy-950/90 text-white backdrop-blur-xl">
      <div className="mx-auto flex items-center justify-between gap-4 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 text-sm font-black text-navy-950 shadow-lg shadow-teal-500/20">
            BiT
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold tracking-wide text-white">BiT App</p>
            <p className="text-[11px] text-slate-500">Decisão pública · Inteligência territorial</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[11px] sm:flex">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-slate-400">
              {catalogStatus === 'success' ? 'API conectada' : 'Modo demonstração'}
            </span>
          </div>

          <div className="flex rounded-full border border-white/[0.08] bg-white/[0.04] p-0.5">
            {idiomas.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setIdioma(item)}
                className={`rounded-full px-2 py-1 text-[11px] font-bold uppercase transition ${
                  idioma === item
                    ? 'bg-white text-navy-950 shadow-sm'
                    : 'text-slate-500 hover:text-white'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

function ServiceNav({ active, onChange, services }) {
  return (
    <nav className="border-b border-white/[0.06] bg-navy-950/60 backdrop-blur-md">
      <div className="mx-auto max-w-[1440px] px-3 sm:px-5">
        <div className="flex gap-1 overflow-x-auto py-2 scrollbar-none">
          {services.map((item) => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange(item.id)}
                className={`group flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-semibold transition-all sm:px-4 ${
                  isActive
                    ? 'text-white shadow-lg'
                    : 'text-slate-500 hover:bg-white/[0.04] hover:text-slate-300'
                }`}
                style={isActive ? { backgroundColor: item.accent, color: '#fff' } : undefined}
              >
                <ServiceIcon path={item.icon} size={16} />
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden">{item.short}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

function KPIStrip({ result, service }) {
  const stats = result?.estatisticas || {};
  const priority = PRIORITY_STATES[result?.prioridade_intervencao || 'SEM_DADOS'] || PRIORITY_STATES.SEM_DADOS;

  const cards = [
    {
      label: 'Regiões analisadas',
      value: stats.total_regioes ?? 0,
      icon: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z',
      color: '#38bdf8',
    },
    {
      label: 'Valor médio',
      value: formatValue(stats.valor_medio),
      icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
      color: service.accent,
    },
    {
      label: 'Região destaque',
      value: stats.regiao_destaque || '—',
      icon: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z',
      color: '#fbbf24',
      truncate: true,
    },
    {
      label: 'Intervenção',
      value: priority.label.replace('Prioridade ', ''),
      icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
      color: priority.color,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="group rounded-xl border border-white/[0.06] bg-navy-900/80 p-3 transition hover:border-white/[0.12] sm:p-4"
        >
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md" style={{ backgroundColor: `${card.color}18` }}>
              <svg className="size-3.5" fill="none" stroke={card.color} strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
              </svg>
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{card.label}</p>
          </div>
          <p className={`mt-2 text-xl font-black text-white sm:text-2xl ${card.truncate ? 'truncate' : ''}`}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function ServiceContext({ service }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-navy-900/80 p-3 sm:p-4">
      <div className="flex size-10 items-center justify-center rounded-lg" style={{ backgroundColor: service.accentBg }}>
        <ServiceIcon path={service.icon} size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-white">{service.label}</p>
        <p className="truncate text-xs text-slate-500">{service.description}</p>
      </div>
      <div className="hidden rounded-md border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 sm:block">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Indicador-guia</p>
        <p className="mt-0.5 text-xs font-bold text-slate-300">{service.indicator}</p>
      </div>
    </div>
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
    <div className="flex min-h-screen flex-col bg-navy-950">
      <Header
        service={service}
        idioma={idioma}
        setIdioma={setIdioma}
        catalogStatus={catalogStatus}
      />
      <ServiceNav active={serviceId} onChange={setServiceId} services={SERVICES} />

      {/* Map hero — protagonista */}
      <section className="mx-auto w-full max-w-[1440px] px-3 pt-3 sm:px-5 sm:pt-4">
        <MapaInterativo
          result={result}
          service={service}
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
          mapRegions={mapRegions}
        />
      </section>

      {/* KPIs + Service Context */}
      <section className="mx-auto w-full max-w-[1440px] px-3 py-3 sm:px-5 sm:py-4">
        <div className="space-y-3">
          <ServiceContext service={service} />
          <KPIStrip result={result} service={service} />
        </div>
      </section>

      {/* Consulta IA + Evidence side by side */}
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-3 pb-6 sm:px-5 sm:pb-8">
        <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr] sm:gap-4">
          <div className="space-y-3 sm:space-y-4">
            <SidebarConsulta {...props} />
          </div>
          <EvidencePanel
            result={result}
            service={service}
            selectedRegion={selectedRegion}
            setSelectedRegion={setSelectedRegion}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] bg-navy-950 py-4">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-3 text-[11px] text-slate-600 sm:px-5">
          <span>BiT App · Equipa 48 · No Country · S06-26</span>
          <span>Dataset Vísent CDRView · Região Metropolitana de Florianópolis</span>
        </div>
      </footer>
    </div>
  );
}
