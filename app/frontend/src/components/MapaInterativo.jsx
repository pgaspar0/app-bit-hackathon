import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import { PRIORITY_STATES } from '../config/product.js';
import { formatValue, getItemCoordinates } from '../utils/data.js';

function markerColor(item) {
  if (item.sem_cobertura) return '#64748b';
  const value = Number(item.valor);
  if (!Number.isFinite(value)) return '#64748b';
  if (value <= 35) return '#f43f5e';
  if (value <= 60) return '#f59e0b';
  return '#10b981';
}

function popupHtml(item, service) {
  const region = item.regiao || 'Região sem nome';
  const indicator = item.indicador || service.indicator;
  const source = item.fonte || 'Fonte não informada';
  const value = Number(item.valor);
  const color = markerColor(item);
  return `
    <div style="font-family: Inter, system-ui, sans-serif; min-width: 200px; padding: 4px 0">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px">
        <span style="width: 10px; height: 10px; border-radius: 50%; background: ${color}; flex-shrink: 0"></span>
        <strong style="font-size: 14px; font-weight: 800; color: #f1f5f9">${region}</strong>
      </div>
      <div style="color: #94a3b8; font-size: 12px; margin-bottom: 4px">${indicator}</div>
      <div style="font-size: 22px; font-weight: 900; color: #f1f5f9; margin-bottom: 8px">${formatValue(item.valor, item.unidade)}</div>
      <div style="display: flex; align-items: center; gap: 6px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1)">
        <svg width="12" height="12" fill="none" stroke="#64748b" stroke-width="2" viewBox="0 0 24 24"><path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
        <span style="font-size: 11px; color: #64748b">${source}</span>
      </div>
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

    map.current = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: true,
    }).setView([-27.593, -48.548], 12);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map.current);

    L.control.zoom({ position: 'bottomright' }).addTo(map.current);
    layer.current = L.layerGroup().addTo(map.current);

    window.setTimeout(() => map.current?.invalidateSize(), 150);

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
      map.current.setView([-27.593, -48.548], 12);
      return;
    }

    const bounds = [];
    withCoord.forEach(({ item, coord }) => {
      bounds.push(coord);
      const value = Number(item.valor);
      const radius = Math.max(450, Math.min(1800, 500 + (Number.isFinite(value) ? value * 10 : 0)));
      const isDimmed = selectedRegion && selectedRegion !== item.regiao;
      const isSelected = selectedRegion === item.regiao;
      const color = markerColor(item);

      const circle = L.circle(coord, {
        radius,
        color: color,
        fillColor: color,
        fillOpacity: isDimmed ? 0.12 : 0.45,
        weight: isSelected ? 3 : 1.5,
        opacity: isDimmed ? 0.3 : 0.8,
      }).addTo(layer.current);

      circle.on('click', () => setSelectedRegion(item.regiao || ''));
      circle.bindPopup(popupHtml(item, service));

      if (isSelected) {
        L.circle(coord, {
          radius: radius + 200,
          color: color,
          fillColor: 'transparent',
          fillOpacity: 0,
          weight: 2,
          opacity: 0.4,
          dashArray: '6, 8',
        }).addTo(layer.current);
      }
    });

    if (bounds.length === 1) {
      map.current.setView(bounds[0], 13);
    } else {
      map.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [withCoord, selectedRegion, service, setSelectedRegion]);

  const selectedItem = withCoord.find(({ item }) => item.regiao === selectedRegion);

  return (
    <section className="relative flex flex-col overflow-hidden rounded-xl border border-white/[0.06] bg-navy-900">
      {/* Map header bar */}
      <div className="absolute left-0 right-0 top-0 z-[500] flex items-center justify-between gap-3 p-3 sm:p-4">
        <div className="glass-panel flex items-center gap-3 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5">
          <div className="flex size-8 items-center justify-center rounded-md" style={{ backgroundColor: service.accent }}>
            <svg className="size-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Território</p>
            <p className="text-sm font-bold text-white">
              {selectedRegion || result?.estatisticas?.regiao_destaque || 'Região metropolitana'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`glass-panel rounded-full px-3 py-1.5 text-[11px] font-bold ring-1 ${priority.tone}`}>
            {priority.label}
          </span>
        </div>
      </div>

      {/* Map container */}
      <div className="relative min-h-[320px] flex-1 sm:min-h-[420px] lg:min-h-[520px]">
        <div ref={mapRef} className="absolute inset-0" />

        {!withCoord.length && (
          <div className="absolute inset-0 z-[400] flex items-center justify-center bg-navy-900/80 p-6 text-center backdrop-blur-sm">
            <div className="max-w-sm rounded-xl border border-white/[0.08] bg-navy-950/90 p-6">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-slate-800">
                <svg className="size-6 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                </svg>
              </div>
              <p className="text-base font-bold text-white">Aguardando coordenadas</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Os dados territoriais estão disponíveis, mas sem latitude/longitude para posicionar no mapa. Realize uma consulta para carregar a camada geográfica.
              </p>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-3 left-3 z-[500] glass-panel rounded-lg p-3 text-[11px] sm:bottom-4 sm:left-4">
          <p className="mb-2 font-bold uppercase tracking-wider text-slate-400">Legenda</p>
          {[
            ['#f43f5e', 'Crítico (≤35)'],
            ['#f59e0b', 'Parcial (36–60)'],
            ['#10b981', 'Adequado (>60)'],
            ['#64748b', 'Sem cobertura'],
          ].map(([color, label]) => (
            <div key={label} className="flex items-center gap-2 py-0.5">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-slate-300">{label}</span>
            </div>
          ))}
        </div>

        {/* Region count badge */}
        <div className="absolute bottom-3 right-14 z-[500] glass-panel flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] sm:bottom-4 sm:right-16">
          <span className="text-slate-400">{withCoord.length} regiões mapeadas</span>
          {withoutCoord.length > 0 && (
            <span className="text-amber-400/80">· {withoutCoord.length} sem coord.</span>
          )}
        </div>
      </div>

      {/* Selected region detail strip */}
      {selectedItem && (
        <div className="soft-in flex items-center gap-4 border-t border-white/[0.06] px-4 py-3">
          <div className="size-3 rounded-full" style={{ backgroundColor: markerColor(selectedItem.item) }} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white">{selectedItem.item.regiao}</p>
            <p className="truncate text-xs text-slate-400">
              {selectedItem.item.indicador || service.indicator} · {selectedItem.item.fonte || 'Vísent CDRView'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-black text-white">{formatValue(selectedItem.item.valor, selectedItem.item.unidade)}</p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedRegion('')}
            className="ml-2 rounded-md p-1.5 text-slate-500 transition hover:bg-white/10 hover:text-white"
          >
            <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </section>
  );
}
