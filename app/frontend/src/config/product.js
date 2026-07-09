export const SERVICES = [
  {
    id: 'formacoes',
    label: 'Formações',
    short: 'Formação',
    accent: '#0d9488',
    accentBg: 'rgba(13, 148, 136, 0.15)',
    icon: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
    indicator: 'Cobertura e acesso para formação',
    backendIndicator: null,
    queryHint: 'Que regiões devem ser priorizadas para ampliar formações com base em cobertura e procura territorial?',
    description: 'Programas de formação tech por região, cruzados com conectividade e lacunas territoriais.',
  },
  {
    id: 'empregabilidade',
    label: 'Empregabilidade',
    short: 'Emprego',
    accent: '#3b82f6',
    accentBg: 'rgba(59, 130, 246, 0.15)',
    icon: 'M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z',
    indicator: 'Concentração de população e potencial de atendimento',
    backendIndicator: null,
    queryHint: 'Onde há maior potencial de encaminhamento para empregabilidade segundo os dados territoriais?',
    description: 'Emprego por região, setor e grupo demográfico, cruzado com concentração de pessoas.',
  },
  {
    id: 'experiencias',
    label: 'Experiências',
    short: 'Experiências',
    accent: '#8b5cf6',
    accentBg: 'rgba(139, 92, 246, 0.15)',
    icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z',
    indicator: 'Capital territorial e concentração comunitária',
    backendIndicator: null,
    queryHint: 'Que territórios devem receber experiências estruturantes primeiro e porquê?',
    description: 'Iniciativas sociais e culturais bem-sucedidas, referências comunitárias por região.',
  },
  {
    id: 'mentorias',
    label: 'Mentorias',
    short: 'Mentoria',
    accent: '#f59e0b',
    accentBg: 'rgba(245, 158, 11, 0.15)',
    icon: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z',
    indicator: 'Procura potencial por rede de apoio',
    backendIndicator: null,
    queryHint: 'Onde programas de mentoria podem gerar maior impacto territorial imediato?',
    description: 'Programas de mentoria pública e parcerias entre governo e sociedade civil.',
  },
  {
    id: 'saude_mental',
    label: 'Saúde Mental',
    short: 'Saúde',
    accent: '#f43f5e',
    accentBg: 'rgba(244, 63, 94, 0.15)',
    icon: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z',
    indicator: 'Pressão de conectividade para cuidado remoto',
    backendIndicator: null,
    queryHint: 'Onde a falta de conectividade pode limitar o acesso a suporte de saúde mental?',
    description: 'Indicadores de saúde mental cruzados com cobertura de rede e suporte remoto.',
  },
];

export const PRIORITY_STATES = {
  ALTA: {
    label: 'Prioridade Alta',
    tone: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
    toneSolid: 'bg-rose-500 text-white',
    color: '#f43f5e',
    bgColor: 'rgba(244, 63, 94, 0.12)',
  },
  MEDIA: {
    label: 'Prioridade Média',
    tone: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
    toneSolid: 'bg-amber-500 text-white',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.12)',
  },
  BAIXA: {
    label: 'Prioridade Baixa',
    tone: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
    toneSolid: 'bg-emerald-500 text-white',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.12)',
  },
  SEM_DADOS: {
    label: 'Sem dados suficientes',
    tone: 'bg-slate-500/15 text-slate-400 ring-slate-500/30',
    toneSolid: 'bg-slate-600 text-white',
    color: '#64748b',
    bgColor: 'rgba(100, 116, 139, 0.12)',
  },
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
