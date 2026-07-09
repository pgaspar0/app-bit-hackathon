import { EMPTY_STATS, PRIORITY_STATES } from '../config/product.js';
import { mockResponses } from '../data/mockResponse.js';

export function normalizePriority(value) {
  const key = String(value || 'SEM_DADOS').toUpperCase();
  return PRIORITY_STATES[key] ? key : 'SEM_DADOS';
}

export function normalizeResult(raw, serviceId) {
  const fallback = mockResponses[serviceId] || mockResponses.formacoes;
  const source = raw && typeof raw === 'object' ? raw : fallback;
  const dados = Array.isArray(source.dados) ? source.dados : [];
  const topRegioes = Array.isArray(source.top_regioes) && source.top_regioes.length
    ? source.top_regioes
    : dados.slice(0, 5);

  return {
    resposta_ia: source.resposta_ia || 'Ainda não há resposta analítica para esta consulta.',
    resumo_executivo: source.resumo_executivo || 'A consulta foi processada, mas o resumo executivo ainda não foi devolvido pelo backend.',
    prioridade_intervencao: normalizePriority(source.prioridade_intervencao),
    recomendacao: source.recomendacao || 'Recolher mais evidência territorial antes de definir a intervenção.',
    estatisticas: { ...EMPTY_STATS, ...(source.estatisticas || {}) },
    top_regioes: topRegioes,
    dados,
    fontes: Array.isArray(source.fontes) ? source.fontes : [],
  };
}

export function makeMockResult(serviceId) {
  return normalizeResult(mockResponses[serviceId] || mockResponses.formacoes, serviceId);
}

export function formatValue(value, unit) {
  if (value === null || value === undefined || value === '') return 'Sem dado';
  const numeric = Number(value);
  const output = Number.isFinite(numeric)
    ? numeric.toLocaleString('pt-PT', { maximumFractionDigits: 1 })
    : String(value);
  return unit ? `${output}${unit}` : output;
}

export function getItemCoordinates(item) {
  const lat = item?.latitude ?? item?.lat ?? item?.coordenadas?.latitude ?? item?.coordenadas?.lat;
  const lng = item?.longitude ?? item?.lng ?? item?.lon ?? item?.coordenadas?.longitude ?? item?.coordenadas?.lng;
  const nLat = Number(lat);
  const nLng = Number(lng);
  if (!Number.isFinite(nLat) || !Number.isFinite(nLng)) return null;
  return [nLat, nLng];
}

export function uniqueRegions(result) {
  const names = new Set();
  (result?.dados || []).forEach((item) => item?.regiao && names.add(item.regiao));
  (result?.top_regioes || []).forEach((item) => item?.regiao && names.add(item.regiao));
  return Array.from(names);
}
