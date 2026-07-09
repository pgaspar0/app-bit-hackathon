import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import { PRIORITY_STATES } from '../config/product.js';
import { formatValue, getItemCoordinates } from '../utils/data.js';

function markerColor(item) {
  if (item.sem_cobertura) return '#64748b';
  const value = Number(item.valor);
  if (!Number.isFinite(value)) return '#64748b';
  if (value <= 35) return '#e11d48';
  if (value <= 60) return '#d97706';
  return '#059669';
}

function popupHtml(item, service) {
  const region = item.regiao || 'Região sem nome';
  const indicator = item.indicador || service.indicator;
  const source = item.fonte || 'Fonte não informada';
  return `
    <div style="font-family: Inter, system-ui, sans-serif; min-width: 220px">
      <strong style="font-size: 14px">${region}</strong>
      <div style="margin-top: 6px; color: #475569">${indicator}</div>
      <div style="margin-top: 2px; font-size: 18px; font-weight: 800; color: #0f172a">${formatValue(item.valor, item.unidade)}</div>
      <div style="margin-top: 6px; color: #64748b; font-size: 12px">${source}</div>
    </div>
  `;
}

export default function MapaInterativo({ result, service, selectedRegion, setSelectedRegion, mapRegions }) {
  const mapRef = useRef(null);
  const map = useRef(null);
  const layer = useRef(null);
  const territorialItems = useMemo(() => {
    if (Array.isArray(mapRegions) && mapRegions.length) {
      return mapRegions.map((region) => ({
        ...region,
        valor: region.valor ?? region.concentracao ?? region.cobertura_rede,
        indicador: region.indicador || service.indicator,
        fonte: 'GET /mapa',
      }));
    }
    return result?.dados || [];
  }, [mapRegions, result, service]);
  const points = useMemo(
    () => territorialItems.map((item) => ({ item, coord: getItemCoordinates(item) })),
    [territorialItems],
  );
  const withCoord = useMemo(() => points.filter((entry) => entry.coord), [points]);
  const withoutCoord = useMemo(() => points.filter((entry) => !entry.coord), [points]);
  const priority = PRIORITY_STATES[result?.prioridade_intervencao || 'SEM_DADOS'] || PRIORITY_STATES.SEM_DADOS;

  useEffect(() => {
    if (!mapRef.current || map.current) return undefined;

    map.current = L.map(mapRef.current, { zoomControl: false }).setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map.current);
    L.control.zoom({ position: 'bottomleft' }).addTo(map.current);
    layer.current = L.layerGroup().addTo(map.current);

    window.setTimeout(() => map.current?.invalidateSize(), 120);

    return () => {
      map.current?.remove();
      map.current = null;
      layer.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current || !layer.current) return;

    layer.current.clearLayers();
    if (!withCoord.length) {
      map.current.setView([0, 0], 2);
      return;
    }

    const bounds = [];
    withCoord.forEach(({ item, coord }) => {
      bounds.push(coord);
      const value = Number(item.valor);
      const radius = Math.max(550, Math.min(2200, 650 + (Number.isFinite(value) ? value * 12 : 0)));
      const isDimmed = selectedRegion && selectedRegion !== item.regiao;
      const circle = L.circle(coord, {
        radius,
        color: markerColor(item),
        fillColor: markerColor(item),
        fillOpacity: isDimmed ? 0.18 : 0.42,
        weight: selectedRegion === item.regiao ? 4 : 2,
      }).addTo(layer.current);

      circle.on('click', () => setSelectedRegion(item.regiao || ''));
      circle.bindPopup(popupHtml(item, service));
    });

    if (bounds.length === 1) {
      map.current.setView(bounds[0], 11);
    } else {
      map.current.fitBounds(bounds, { padding: [42, 42], maxZoom: 12 });
    }
  }, [withCoord, selectedRegion, service, setSelectedRegion]);

  return (
    <section className="sticky top-24 flex flex-col overflow-hidden rounded-lg border border-slate-800 bg-slate-950 text-white shadow-sm lg:h-[calc(100vh-7rem)]">
      <div className="border-b border-white/10 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Território</p>
            <h2 className="mt-1 text-xl font-black">
              {selectedRegion || result?.estatisticas?.regiao_destaque || 'Contexto geográfico'}
            </h2>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${priority.tone}`}>
            {priority.label}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
          <div className="rounded-md bg-white/10 p-3">
            <p className="text-slate-400">Com coordenadas</p>
            <p className="mt-1 text-lg font-black">{withCoord.length}</p>
          </div>
          <div className="rounded-md bg-white/10 p-3">
            <p className="text-slate-400">Sem coordenadas</p>
            <p className="mt-1 text-lg font-black">{withoutCoord.length}</p>
          </div>
          <div className="rounded-md bg-white/10 p-3">
            <p className="text-slate-400">Fontes</p>
            <p className="mt-1 text-lg font-black">{result?.fontes?.length || (mapRegions?.length ? 1 : 0)}</p>
          </div>
        </div>
      </div>

      <div className="relative min-h-[420px] flex-1">
        <div ref={mapRef} className="absolute inset-0" />

        {!withCoord.length && (
          <div className="absolute inset-0 z-[400] flex items-center justify-center bg-slate-900/80 p-6 text-center backdrop-blur-sm">
            <div className="max-w-sm rounded-lg border border-white/10 bg-slate-950/90 p-5">
              <p className="text-lg font-black">Mapa sem coordenadas disponíveis</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                A consulta tem evidência territorial, mas o backend ainda não devolveu latitude/longitude para desenhar
                camadas geográficas.
              </p>
            </div>
          </div>
        )}

        <div className="absolute bottom-4 left-4 z-[500] rounded-lg border border-white/10 bg-slate-950/90 p-3 text-xs shadow-xl backdrop-blur">
          <p className="mb-2 font-black uppercase tracking-wide text-slate-400">Legenda</p>
          {[
            ['#e11d48', 'Crítico'],
            ['#d97706', 'Parcial'],
            ['#059669', 'Adequado'],
            ['#64748b', 'Sem cobertura'],
          ].map(([color, label]) => (
            <div key={label} className="flex items-center gap-2 py-0.5">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {withoutCoord.length > 0 && (
        <div className="border-t border-white/10 p-4">
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">Regiões sem camada cartográfica</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {withoutCoord.slice(0, 6).map(({ item }, index) => (
              <span key={`${item.regiao || 'sem-regiao'}-${index}`} className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
                {item.regiao || 'Sem nome'}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
