export const mockResponses = {
  formacoes: {
    resposta_ia: 'Os dados indicam desigualdade no acesso a formações entre regiões com procura potencial e oferta disponível. A intervenção deve combinar expansão de vagas, apoio de conectividade e priorização territorial baseada no ranking.',
    resumo_executivo: 'A maior lacuna aparece nas regiões com baixo valor do indicador e maior concentração de população-alvo. A prioridade é ampliar oferta onde a cobertura é insuficiente.',
    prioridade_intervencao: 'ALTA',
    recomendacao: 'Abrir uma frente de formação móvel nas regiões prioritárias, iniciar turmas-piloto em até 60 dias e pactuar metas por território com monitorização mensal.',
    estatisticas: {
      total_registros: 18,
      total_regioes: 6,
      valor_medio: 46,
      valor_minimo: 18,
      valor_maximo: 82,
      regiao_destaque: 'Região Piloto Norte',
    },
    top_regioes: [
      { regiao: 'Região Piloto Norte', municipio: 'Município exemplo', indicador: 'Cobertura de formação', valor: 18, fonte: 'Base integrada BiT', data_referencia: '2026-01-01', unidade: '%' },
      { regiao: 'Eixo Comunitário Leste', municipio: 'Município exemplo', indicador: 'Cobertura de formação', valor: 34, fonte: 'Base integrada BiT', data_referencia: '2026-01-01', unidade: '%' },
      { regiao: 'Área de Transição Sul', municipio: 'Município exemplo', indicador: 'Cobertura de formação', valor: 41, fonte: 'Base integrada BiT', data_referencia: '2026-01-01', unidade: '%' },
    ],
    dados: [
      { regiao: 'Região Piloto Norte', municipio: 'Município exemplo', indicador: 'Cobertura de formação', valor: 18, fonte: 'Base integrada BiT', data_referencia: '2026-01-01', unidade: '%' },
      { regiao: 'Eixo Comunitário Leste', municipio: 'Município exemplo', indicador: 'Cobertura de formação', valor: 34, fonte: 'Base integrada BiT', data_referencia: '2026-01-01', unidade: '%' },
      { regiao: 'Área de Transição Sul', municipio: 'Município exemplo', indicador: 'Cobertura de formação', valor: 41, fonte: 'Base integrada BiT', data_referencia: '2026-01-01', unidade: '%' },
      { regiao: 'Centro de Referência Oeste', municipio: 'Município exemplo', indicador: 'Cobertura de formação', valor: 82, fonte: 'Base integrada BiT', data_referencia: '2026-01-01', unidade: '%' },
    ],
    fontes: ['Base integrada BiT', 'Registos administrativos', 'Dados territoriais agregados'],
  },
  empregabilidade: {
    resposta_ia: 'A análise sugere concentração de procura por emprego em áreas onde o indicador de inserção formal permanece baixo. O mapa deve ser usado para cruzar prioridade social com capacidade de atendimento.',
    resumo_executivo: 'Há territórios com baixa inserção produtiva e evidência suficiente para ação coordenada entre formação e encaminhamento profissional.',
    prioridade_intervencao: 'MEDIA',
    recomendacao: 'Priorizar feiras de empregabilidade e encaminhamento ativo nas três regiões de menor valor, integrando formação curta com empresas parceiras.',
    estatisticas: {
      total_registros: 14,
      total_regioes: 5,
      valor_medio: 52,
      valor_minimo: 27,
      valor_maximo: 76,
      regiao_destaque: 'Corredor Produtivo Leste',
    },
    top_regioes: [
      { regiao: 'Corredor Produtivo Leste', municipio: 'Município exemplo', indicador: 'Inserção formal', valor: 27, fonte: 'Base integrada BiT', data_referencia: '2026-01-01', unidade: '%' },
      { regiao: 'Região Piloto Norte', municipio: 'Município exemplo', indicador: 'Inserção formal', valor: 39, fonte: 'Base integrada BiT', data_referencia: '2026-01-01', unidade: '%' },
    ],
    dados: [
      { regiao: 'Corredor Produtivo Leste', municipio: 'Município exemplo', indicador: 'Inserção formal', valor: 27, fonte: 'Base integrada BiT', data_referencia: '2026-01-01', unidade: '%' },
      { regiao: 'Região Piloto Norte', municipio: 'Município exemplo', indicador: 'Inserção formal', valor: 39, fonte: 'Base integrada BiT', data_referencia: '2026-01-01', unidade: '%' },
      { regiao: 'Centro de Referência Oeste', municipio: 'Município exemplo', indicador: 'Inserção formal', valor: 76, fonte: 'Base integrada BiT', data_referencia: '2026-01-01', unidade: '%' },
    ],
    fontes: ['Base integrada BiT', 'Registos de programas', 'Indicadores de emprego'],
  },
};
