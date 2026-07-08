import { useState } from 'react';
import SidebarConsulta from './SidebarConsulta';
import MapaInterativo from './MapaInterativo';

const servicos = [
  { id: 'formacoes', label: { pt: 'Formações', es: 'Formaciones', en: 'Training' } },
  { id: 'empregabilidade', label: { pt: 'Empregabilidade', es: 'Empleabilidad', en: 'Employability' } },
  { id: 'experiencias', label: { pt: 'Exp. Estruturantes', es: 'Exp. Estructurantes', en: 'Struct. Experiences' } },
  { id: 'mentorias', label: { pt: 'Mentorias', es: 'Mentorías', en: 'Mentorships' } },
  { id: 'saude_mental', label: { pt: 'Saúde Mental', es: 'Salud Mental', en: 'Mental Health' } },
];

const servicoCores = {
  formacoes: '#00B4D8', empregabilidade: '#2A9D8F', experiencias: '#8B5CF6',
  mentorias: '#F4A261', saude_mental: '#E76F51',
};

const idiomas = [
  { id: 'pt', label: 'PT' },
  { id: 'es', label: 'ES' },
  { id: 'en', label: 'EN' },
];

const titulos = {
  pt: 'Painel de Inclusão Digital',
  es: 'Panel de Inclusión Digital',
  en: 'Digital Inclusion Dashboard',
};

const badgeTextos = {
  pt: 'Dataset Vísent CDRView Ativo',
  es: 'Dataset Vísent CDRView Activo',
  en: 'Dataset Vísent CDRView Active',
};

export default function DashboardLayout() {
  const [servicoAtivo, setServicoAtivo] = useState('formacoes');
  const [regiaoAtiva, setRegiaoAtiva] = useState('todas');
  const [idioma, setIdioma] = useState('pt');

  const t = (obj) => obj[idioma];

  return (
    <div className="min-h-screen bg-[#F8F9FA] overflow-x-hidden">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3 sm:px-8 sm:py-5 shadow-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div
            className="flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-lg text-xs sm:text-sm font-bold text-white"
            style={{ backgroundColor: servicoCores[servicoAtivo] }}
          >
            B
          </div>
          <h1 className="text-base sm:text-xl font-semibold tracking-tight text-gray-800 truncate">
            App BiT{' '}
            <span className="font-light text-gray-400 hidden xs:inline">—</span>{' '}
            <span className="font-normal text-gray-500 text-sm sm:text-base hidden sm:inline">
              {titulos[idioma]}
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-0.5 shrink-0">
            {idiomas.map((l) => (
              <button
                key={l.id}
                onClick={() => setIdioma(l.id)}
                className={`rounded-md px-2 sm:px-3 py-1 text-[11px] sm:text-xs font-medium transition ${
                  idioma === l.id ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium text-green-700 ring-1 ring-green-200 whitespace-nowrap">
            <span className="size-1.5 sm:size-2 rounded-full bg-green-500 shrink-0" />
            <span className="hidden sm:inline">{badgeTextos[idioma]}</span>
            <span className="sm:hidden">CDRView</span>
          </span>
        </div>
      </header>

      <div className="overflow-x-auto border-b border-gray-200 bg-white scrollbar-hide">
        <div className="flex items-center gap-1 sm:gap-2 px-4 sm:px-8 py-2 sm:py-3 w-max min-w-full">
          {servicos.map((s) => (
            <button
              key={s.id}
              onClick={() => setServicoAtivo(s.id)}
              className={`whitespace-nowrap rounded-lg sm:rounded-xl px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-medium transition ${
                servicoAtivo === s.id
                  ? 'bg-gray-800 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              {t(s.label)}
            </button>
          ))}
        </div>
      </div>

      <main className="flex flex-col gap-3 sm:gap-5 p-3 sm:p-4 lg:p-6 lg:flex-row lg:h-[calc(100vh-96px)]">
        <section className="w-full lg:w-[40%] lg:flex lg:flex-col lg:h-full lg:overflow-hidden">
          <div className="rounded-xl bg-white shadow-sm lg:flex-1 lg:overflow-y-auto">
            <SidebarConsulta
              servicoAtivo={servicoAtivo}
              regiaoAtiva={regiaoAtiva}
              onRegiaoChange={setRegiaoAtiva}
              corBase={servicoCores[servicoAtivo]}
              idioma={idioma}
            />
          </div>
        </section>

        <section className="w-full lg:w-[60%] lg:flex lg:flex-col lg:h-full">
          <div className="flex-1 overflow-hidden rounded-xl bg-white shadow-sm">
            <MapaInterativo
              servicoAtivo={servicoAtivo}
              idioma={idioma}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
