import { useState } from 'react';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';

const regioes = [
  { id: 'zona-norte', nome: { pt: 'Zona Urbana Norte', es: 'Zona Urbana Norte', en: 'North Urban Zone' }, lat: -15.195, lng: 12.15, cobertura_rede: 30, concentracao: 85 },
  { id: 'distrito-sul', nome: { pt: 'Distrito Industrial Sul', es: 'Distrito Industrial Sur', en: 'South Industrial District' }, lat: -15.21, lng: 12.165, cobertura_rede: 75, concentracao: 40 },
];

const nomesServicos = {
  formacoes: { pt: 'Formações', es: 'Formaciones', en: 'Training' },
  empregabilidade: { pt: 'Empregabilidade', es: 'Empleabilidad', en: 'Employability' },
  experiencias: { pt: 'Exp. Estruturantes', es: 'Exp. Estructurantes', en: 'Struct. Experiences' },
  mentorias: { pt: 'Mentorias', es: 'Mentorías', en: 'Mentorships' },
  saude_mental: { pt: 'Saúde Mental', es: 'Salud Mental', en: 'Mental Health' },
};

const legendas = {
  alerta: { pt: 'Alerta — serviço crítico', es: 'Alerta — servicio crítico', en: 'Alert — critical service' },
  parcial: { pt: 'Cobertura Parcial', es: 'Cobertura Parcial', en: 'Partial Coverage' },
  solida: { pt: 'Infraestrutura Sólida', es: 'Infraestructura Sólida', en: 'Solid Infrastructure' },
};

const indicadoresPorServico = {
  formacoes: (r) => ({ valor: r.id === 'zona-norte' ? 28 : 72, label: { pt: 'Cobertura de Formação', es: 'Cobertura de Formación', en: 'Training Coverage' }, alerta: r.id === 'zona-norte' }),
  empregabilidade: (r) => ({ valor: r.id === 'zona-norte' ? 22 : 68, label: { pt: 'Taxa de Emprego Formal', es: 'Tasa de Empleo Formal', en: 'Formal Employment Rate' }, alerta: r.id === 'zona-norte' }),
  experiencias: (r) => ({ valor: r.id === 'zona-norte' ? 0 : 3, label: { pt: 'Iniciativas Activas', es: 'Iniciativas Activas', en: 'Active Initiatives' }, alerta: r.id === 'zona-norte' }),
  mentorias: (r) => ({ valor: r.id === 'zona-norte' ? 0 : 2, label: { pt: 'Programas de Mentoria', es: 'Programas de Mentoría', en: 'Mentorship Programs' }, alerta: r.id === 'zona-norte' }),
  saude_mental: (r) => ({ valor: r.cobertura_rede, label: { pt: 'Cobertura p/ Teleatendimento', es: 'Cobertura para Teleatención', en: 'Telecare Coverage' }, alerta: r.cobertura_rede < 40 }),
};

const tagsTexto = {
  faltaConexao: { pt: 'Falta Conectividade', es: 'Falta Conectividad', en: 'Lacks Connectivity' },
  conexaoOK: { pt: 'Conectividade OK', es: 'Conectividad OK', en: 'Connectivity OK' },
  altaConc: { pt: 'Alta Concentração', es: 'Alta Concentración', en: 'High Concentration' },
  baixaConc: { pt: 'Baixa Concentração', es: 'Baja Concentración', en: 'Low Concentration' },
  faltaServ: { pt: 'Falta {servico}', es: 'Falta {servico}', en: 'Lacks {servico}' },
  servOK: { pt: '{servico} OK', es: '{servico} OK', en: '{servico} OK' },
  cobertura: { pt: 'Cobertura de rede:', es: 'Cobertura de red:', en: 'Network coverage:' },
  concentracao: { pt: 'Concentração:', es: 'Concentración:', en: 'Concentration:' },
};

function getCor(r, servicoAtivo) {
  const ind = indicadoresPorServico[servicoAtivo](r);
  if (ind.alerta) return '#E63946';
  if (r.cobertura_rede < 60) return '#F4A261';
  return '#06D6A0';
}

const statusAlerta = {
  alerta: { pt: 'Alerta Social — Prioritário', es: 'Alerta Social — Prioritario', en: 'Social Alert — Priority' },
  regular: { pt: 'Infraestrutura Regular', es: 'Infraestructura Regular', en: 'Regular Infrastructure' },
};

export default function MapaInterativo({ servicoAtivo, idioma }) {
  const [selected, setSelected] = useState(null);

  const t = (obj) => (typeof obj === 'string' ? obj : obj[idioma]);

  return (
    <div className="relative size-full">
      <MapContainer center={[-15.202, 12.158]} zoom={13} className="size-full rounded-xl" scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {regioes.map((r, i) => {
          const cor = getCor(r, servicoAtivo);
          const ind = indicadoresPorServico[servicoAtivo](r);
          return (
            <Circle
              key={i}
              center={[r.lat, r.lng]}
              radius={300}
              pathOptions={{ color: cor, fillColor: cor, fillOpacity: 0.35, weight: 2 }}
              eventHandlers={{ click: () => setSelected(selected?.id === r.id ? null : r) }}
            >
              <Popup>
                <div className="text-xs sm:text-sm font-sans">
                  <p className="mb-1 font-semibold text-sm sm:text-base">{t(r.nome)}</p>
                  <p><span className="text-gray-500">{t(tagsTexto.cobertura)}</span> <strong>{r.cobertura_rede}%</strong></p>
                  <p><span className="text-gray-500">{t(tagsTexto.concentracao)}</span> <strong>{r.concentracao}%</strong></p>
                  <p><span className="text-gray-500">{t(ind.label)}:</span> <strong>{ind.valor}{typeof ind.valor === 'number' ? '%' : ''}</strong></p>
                  <p className="mt-1 flex flex-wrap gap-1">
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[9px] sm:text-[10px] text-blue-700">
                      {r.cobertura_rede < 40 ? t(tagsTexto.faltaConexao) : t(tagsTexto.conexaoOK)}
                    </span>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[9px] sm:text-[10px] text-blue-700">
                      {r.concentracao > 70 ? t(tagsTexto.altaConc) : t(tagsTexto.baixaConc)}
                    </span>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[9px] sm:text-[10px] text-blue-700">
                      {ind.alerta ? t(tagsTexto.faltaServ).replace('{servico}', t(nomesServicos[servicoAtivo])) : t(tagsTexto.servOK).replace('{servico}', t(nomesServicos[servicoAtivo]))}
                    </span>
                  </p>
                </div>
              </Popup>
            </Circle>
          );
        })}
      </MapContainer>

      {selected && (
        <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-auto bottom-4 sm:top-1/2 sm:-translate-y-1/2 z-[1000] mx-auto max-w-[calc(100vw-16px)] sm:max-w-xs rounded-2xl border border-gray-700 bg-gray-800/95 p-4 sm:p-5 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="size-2 sm:size-2.5 rounded-full shrink-0" style={{ backgroundColor: getCor(selected, servicoAtivo) }} />
                <p className="text-sm font-semibold text-white truncate">{t(selected.nome)}</p>
              </div>
              <p className="mt-1 text-[11px] text-gray-400">
                {getCor(selected, servicoAtivo) === '#E63946' ? t(statusAlerta.alerta) : t(statusAlerta.regular)}
              </p>
            </div>
            <button onClick={() => setSelected(null)} className="rounded-full p-1 text-gray-500 transition hover:bg-gray-700 hover:text-white shrink-0">
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="mt-3 sm:mt-4 grid grid-cols-3 gap-3">
            <div className="min-w-0"><p className="text-[10px] text-gray-500 truncate">{t(tagsTexto.cobertura)}</p><p className="text-base sm:text-lg font-bold text-white">{selected.cobertura_rede}%</p></div>
            <div className="min-w-0"><p className="text-[10px] text-gray-500 truncate">{t(tagsTexto.concentracao)}</p><p className="text-base sm:text-lg font-bold text-white">{selected.concentracao}%</p></div>
            <div className="min-w-0"><p className="text-[10px] text-gray-500 truncate">{t(indicadoresPorServico[servicoAtivo](selected).label)}</p><p className="text-base sm:text-lg font-bold text-white">{indicadoresPorServico[servicoAtivo](selected).valor}{typeof indicadoresPorServico[servicoAtivo](selected).valor === 'number' ? '%' : ''}</p></div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {[
              selected.cobertura_rede < 40 ? t(tagsTexto.faltaConexao) : t(tagsTexto.conexaoOK),
              selected.concentracao > 70 ? t(tagsTexto.altaConc) : t(tagsTexto.baixaConc),
              indicadoresPorServico[servicoAtivo](selected).alerta ? t(tagsTexto.faltaServ).replace('{servico}', t(nomesServicos[servicoAtivo])) : t(tagsTexto.servOK).replace('{servico}', t(nomesServicos[servicoAtivo])),
            ].map((tag, i) => (
              <span key={i} className="rounded-full bg-gray-700 px-2 sm:px-3 py-1 text-[10px] sm:text-[11px] text-gray-300">{tag}</span>
            ))}
          </div>
        </div>
      )}

      <div className="absolute bottom-3 right-3 z-[1000] flex flex-col gap-1 rounded-xl border border-gray-700 bg-gray-800/80 px-3 py-2 sm:px-4 sm:py-3 backdrop-blur-sm">
        <p className="text-[10px] sm:text-[11px] font-medium text-gray-400">{t({ pt: 'Legenda', es: 'Leyenda', en: 'Legend' })}</p>
        <div className="flex items-center gap-1.5 sm:gap-2"><span className="size-2 sm:size-2.5 rounded-full bg-[#E63946]" /><span className="text-[10px] sm:text-[11px] text-gray-300 whitespace-nowrap">{t(legendas.alerta)}</span></div>
        <div className="flex items-center gap-1.5 sm:gap-2"><span className="size-2 sm:size-2.5 rounded-full bg-[#F4A261]" /><span className="text-[10px] sm:text-[11px] text-gray-300 whitespace-nowrap">{t(legendas.parcial)}</span></div>
        <div className="flex items-center gap-1.5 sm:gap-2"><span className="size-2 sm:size-2.5 rounded-full bg-[#06D6A0]" /><span className="text-[10px] sm:text-[11px] text-gray-300 whitespace-nowrap">{t(legendas.solida)}</span></div>
      </div>
    </div>
  );
}
