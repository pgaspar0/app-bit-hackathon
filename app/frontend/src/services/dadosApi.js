import { normalizeResult } from '../utils/data.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function fetchDados({ consulta, filtros, idioma, serviceId }) {
  const response = await fetch(`${API_BASE_URL}/dados`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      consulta,
      filtros: {
        regiao: filtros?.regiao || null,
        indicador: filtros?.indicador || null,
        servico: filtros?.servico || serviceId || null,
      },
      idioma,
    }),
  });

  if (!response.ok) {
    throw new Error(`POST /dados falhou com estado ${response.status}`);
  }

  return normalizeResult(await response.json(), serviceId);
}

export async function fetchMapa({ serviceId, indicador } = {}) {
  const params = new URLSearchParams();
  if (serviceId) params.set('servico', serviceId);
  if (indicador) params.set('indicador', indicador);
  const suffix = params.toString() ? `?${params.toString()}` : '';
  const response = await fetch(`${API_BASE_URL}/mapa${suffix}`);

  if (!response.ok) {
    throw new Error(`GET /mapa falhou com estado ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data?.regioes) ? data.regioes : [];
}

export async function fetchRegioes() {
  const response = await fetch(`${API_BASE_URL}/regioes`);
  if (!response.ok) {
    throw new Error(`GET /regioes falhou com estado ${response.status}`);
  }
  return response.json();
}

export async function fetchIndicadores() {
  const response = await fetch(`${API_BASE_URL}/indicadores`);
  if (!response.ok) {
    throw new Error(`GET /indicadores falhou com estado ${response.status}`);
  }
  return response.json();
}
