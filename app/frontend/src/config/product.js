export const SERVICES = [
  {
    id: 'formacoes',
    label: 'Formações',
    short: 'Formação',
    accent: '#0f766e',
    indicator: 'Cobertura e acesso para formação',
    backendIndicator: null,
    queryHint: 'Que regiões devem ser priorizadas para ampliar formações com base em cobertura e procura territorial?',
  },
  {
    id: 'empregabilidade',
    label: 'Empregabilidade',
    short: 'Emprego',
    accent: '#1d4ed8',
    indicator: 'Concentração de população e potencial de atendimento',
    backendIndicator: null,
    queryHint: 'Onde há maior potencial de encaminhamento para empregabilidade segundo os dados territoriais?',
  },
  {
    id: 'experiencias',
    label: 'Experiências Estruturantes',
    short: 'Experiências',
    accent: '#7c3aed',
    indicator: 'Capital territorial e concentração comunitária',
    backendIndicator: null,
    queryHint: 'Que territórios devem receber experiências estruturantes primeiro e porquê?',
  },
  {
    id: 'mentorias',
    label: 'Mentorias',
    short: 'Mentoria',
    accent: '#b45309',
    indicator: 'Procura potencial por rede de apoio',
    backendIndicator: null,
    queryHint: 'Onde programas de mentoria podem gerar maior impacto territorial imediato?',
  },
  {
    id: 'saude_mental',
    label: 'Saúde Mental',
    short: 'Saúde',
    accent: '#be123c',
    indicator: 'Pressão de conectividade para cuidado remoto',
    backendIndicator: null,
    queryHint: 'Onde a falta de conectividade pode limitar o acesso a suporte de saúde mental?',
  },
];

export const PRIORITY_STATES = {
  ALTA: { label: 'Prioridade alta', tone: 'bg-rose-100 text-rose-800 ring-rose-200', color: '#e11d48' },
  MEDIA: { label: 'Prioridade média', tone: 'bg-amber-100 text-amber-800 ring-amber-200', color: '#d97706' },
  BAIXA: { label: 'Prioridade baixa', tone: 'bg-emerald-100 text-emerald-800 ring-emerald-200', color: '#059669' },
  SEM_DADOS: { label: 'Sem dados suficientes', tone: 'bg-slate-100 text-slate-700 ring-slate-200', color: '#64748b' },
};

export const SUGGESTED_QUERIES = [
  'Que regiões devem ser priorizadas para ampliar o acesso ao serviço selecionado?',
  'Onde há maior desigualdade territorial segundo os dados disponíveis?',
  'Que evidências sustentam uma intervenção pública imediata?',
];

export const EMPTY_STATS = {
  total_registros: 0,
  total_regioes: 0,
  valor_medio: 0,
  valor_minimo: 0,
  valor_maximo: 0,
  regiao_destaque: 'Sem destaque definido',
};

export function serviceById(id) {
  return SERVICES.find((service) => service.id === id) || SERVICES[0];
}
