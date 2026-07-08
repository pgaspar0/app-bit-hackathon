import { useState } from 'react';

const regioes = [
  { id: 'todas', nome: { pt: 'Todas as Regiões', es: 'Todas las Regiones', en: 'All Regions' } },
  { id: 'zona-norte', nome: { pt: 'Zona Urbana Norte', es: 'Zona Urbana Norte', en: 'North Urban Zone' } },
  { id: 'distrito-sul', nome: { pt: 'Distrito Industrial Sul', es: 'Distrito Industrial Sur', en: 'South Industrial District' } },
];

const servicoNomes = {
  formacoes: { pt: 'Formações', es: 'Formaciones', en: 'Training' },
  empregabilidade: { pt: 'Empregabilidade', es: 'Empleabilidad', en: 'Employability' },
  experiencias: { pt: 'Exp. Estruturantes', es: 'Exp. Estructurantes', en: 'Struct. Experiences' },
  mentorias: { pt: 'Mentorias', es: 'Mentorías', en: 'Mentorships' },
  saude_mental: { pt: 'Saúde Mental', es: 'Salud Mental', en: 'Mental Health' },
};

const textos = {
  placeholder: { pt: 'Ex: Onde faltam programas de formação...', es: 'Ej: Dónde faltan programas de formación...', en: 'Ex: Where are training programs missing...' },
  consultar: { pt: 'Consultar IA', es: 'Consultar IA', en: 'Query AI' },
  analisando: { pt: 'A analisar...', es: 'Analizando...', en: 'Analyzing...' },
  aguardando: { pt: 'Aguardando consulta...', es: 'Esperando consulta...', en: 'Awaiting query...' },
  dica: { pt: 'Escolha uma sugestão ou escreva a sua pergunta.', es: 'Elija una sugerencia o escriba su pregunta.', en: 'Choose a suggestion or type your question.' },
  processando: { pt: 'A processar resposta da IA...', es: 'Procesando respuesta de la IA...', en: 'Processing AI response...' },
  fonte: { pt: 'Fonte:', es: 'Fuente:', en: 'Source:' },
  novaConsulta: { pt: 'Nova Consulta', es: 'Nueva Consulta', en: 'New Query' },
  consultaDados: { pt: 'Consulta de Dados', es: 'Consulta de Datos', en: 'Data Query' },
  descricao: { pt: 'Faça perguntas sobre indicadores sociais e territoriais.', es: 'Haga preguntas sobre indicadores sociales y territoriales.', en: 'Ask questions about social and territorial indicators.' },
};

const mockPorServico = {
  formacoes: {
    sugestoes: {
      pt: ['Onde faltam programas de formação para jovens de baixa renda?', 'Quais regiões têm pouca formação tech mesmo com alta concentração?', 'Onde a cobertura de rede limita o acesso a cursos online?'],
      es: ['Dónde faltan programas de formación para jóvenes de bajos ingresos?', 'Qué regiones tienen poca formación tech con alta concentración?', 'Dónde la cobertura de red limita el acceso a cursos online?'],
      en: ['Where are training programs for low-income youth missing?', 'Which regions have low tech training despite high concentration?', 'Where does network coverage limit access to online courses?'],
    },
    resposta: {
      resposta_ia: {
        pt: 'A Zona Urbana Norte apresenta 85% de concentração juvenil mas apenas 30% de cobertura de rede, inviabilizando formações online. Recomenda-se priorizar infraestrutura digital antes de expandir programas de formação presencial.',
        es: 'La Zona Urbana Norte presenta 85% de concentración juvenil pero solo 30% de cobertura de red, imposibilitando formaciones online. Se recomienda priorizar infraestructura digital antes de expandir programas de formación presencial.',
        en: 'The North Urban Zone has 85% youth concentration but only 30% network coverage, making online training unfeasible. Digital infrastructure should be prioritized before expanding in-person training programs.',
      },
      dados: [
        { regiao: { pt: 'Zona Urbana Norte', es: 'Zona Urbana Norte', en: 'North Urban Zone' }, valor: 28, fonte: 'Vísent CDRView' },
        { regiao: { pt: 'Distrito Industrial Sul', es: 'Distrito Industrial Sur', en: 'South Industrial District' }, valor: 72, fonte: 'Vísent CDRView' },
      ],
      fontes: ['Vísent CDRView', { pt: 'Ministério da Educação', es: 'Ministerio de Educación', en: 'Ministry of Education' }],
    },
  },
  empregabilidade: {
    sugestoes: {
      pt: ['Regiões com muita concentração de pessoas mas sem emprego formal?', 'Onde o desemprego jovem é mais crítico?', 'Que zonas têm potencial de mão de obra não aproveitado?'],
      es: ['Regiones con alta concentración de personas pero sin empleo formal?', 'Dónde el desempleo juvenil es más crítico?', 'Qué zonas tienen potencial de mano de obra no aprovechado?'],
      en: ['Regions with high people concentration but no formal employment?', 'Where is youth unemployment most critical?', 'Which areas have untapped labor potential?'],
    },
    resposta: {
      resposta_ia: {
        pt: 'A Zona Urbana Norte regista 85% de concentração populacional mas apenas 22% de emprego formal. O Distrito Industrial Sul tem 75% de cobertura de rede e 68% de emprego, sugerindo correlação positiva entre conectividade e formalidade.',
        es: 'La Zona Urbana Norte registra 85% de concentración poblacional pero solo 22% de empleo formal. El Distrito Industrial Sur tiene 75% de cobertura de red y 68% de empleo, sugiriendo correlación positiva entre conectividad y formalidad.',
        en: 'The North Urban Zone has 85% population concentration but only 22% formal employment. The South Industrial District has 75% network coverage and 68% employment, suggesting a positive correlation between connectivity and formality.',
      },
      dados: [
        { regiao: { pt: 'Zona Urbana Norte', es: 'Zona Urbana Norte', en: 'North Urban Zone' }, valor: 22, fonte: 'Vísent CDRView' },
        { regiao: { pt: 'Distrito Industrial Sul', es: 'Distrito Industrial Sur', en: 'South Industrial District' }, valor: 68, fonte: 'Vísent CDRView' },
      ],
      fontes: ['Vísent CDRView', { pt: 'INE', es: 'INE', en: 'National Statistics' }],
    },
  },
  experiencias: {
    sugestoes: {
      pt: ['Onde há iniciativas sociais bem-sucedidas que podem ser replicadas?', 'Que comunidades têm líderes locais ativos?', 'Onde falta apoio institucional a projetos culturais?'],
      es: ['Dónde hay iniciativas sociales exitosas que pueden replicarse?', 'Qué comunidades tienen líderes locales activos?', 'Dónde falta apoyo institucional a proyectos culturales?'],
      en: ['Where are successful social initiatives that can be replicated?', 'Which communities have active local leaders?', 'Where is institutional support for cultural projects lacking?'],
    },
    resposta: {
      resposta_ia: {
        pt: 'O Distrito Industrial Sul concentra 3 iniciativas comunitárias activas (cooperativa digital, horta urbana, centro de formação). A Zona Urbana Norte não regista nenhuma experiência estruturada, apesar da alta concentração populacional.',
        es: 'El Distrito Industrial Sur concentra 3 iniciativas comunitarias activas (cooperativa digital, huerta urbana, centro de formación). La Zona Urbana Norte no registra ninguna experiencia estructurada, a pesar de la alta concentración poblacional.',
        en: 'The South Industrial District has 3 active community initiatives (digital cooperative, urban garden, training center). The North Urban Zone has no structured experiences, despite high population concentration.',
      },
      dados: [
        { regiao: { pt: 'Zona Urbana Norte', es: 'Zona Urbana Norte', en: 'North Urban Zone' }, valor: 0, fonte: 'Vísent CDRView' },
        { regiao: { pt: 'Distrito Industrial Sul', es: 'Distrito Industrial Sur', en: 'South Industrial District' }, valor: 3, fonte: 'Vísent CDRView' },
      ],
      fontes: ['Vísent CDRView', { pt: 'Registo Comunitário', es: 'Registro Comunitario', en: 'Community Registry' }],
    },
  },
  mentorias: {
    sugestoes: {
      pt: ['Onde faltam programas de mentoria pública?', 'Que regiões têm potencial para conectar mentores e jovens?', 'Onde a falta de mentoria agrava o desemprego jovem?'],
      es: ['Dónde faltan programas de mentoría pública?', 'Qué regiones tienen potencial para conectar mentores y jóvenes?', 'Dónde la falta de mentoría agrava el desempleo juvenil?'],
      en: ['Where are public mentorship programs missing?', 'Which regions have potential to connect mentors and youth?', 'Where does lack of mentorship worsen youth unemployment?'],
    },
    resposta: {
      resposta_ia: {
        pt: 'A Zona Urbana Norte não possui nenhum programa de mentoria pública activo, contrastando com o Distrito Industrial Sul que tem 2 programas em funcionamento. Recomenda-se criar pontos de mentoria nas áreas com alta concentração e baixa cobertura.',
        es: 'La Zona Urbana Norte no posee ningún programa de mentoría pública activo, contrastando con el Distrito Industrial Sur que tiene 2 programas en funcionamiento. Se recomienda crear puntos de mentoría en las áreas con alta concentración y baja cobertura.',
        en: 'The North Urban Zone has no active public mentorship programs, contrasting with the South Industrial District which has 2 programs running. Mentorship points should be created in areas with high concentration and low coverage.',
      },
      dados: [
        { regiao: { pt: 'Zona Urbana Norte', es: 'Zona Urbana Norte', en: 'North Urban Zone' }, valor: 0, fonte: 'Vísent CDRView' },
        { regiao: { pt: 'Distrito Industrial Sul', es: 'Distrito Industrial Sur', en: 'South Industrial District' }, valor: 2, fonte: 'Vísent CDRView' },
      ],
      fontes: ['Vísent CDRView', { pt: 'Ministério da Juventude', es: 'Ministerio de Juventud', en: 'Ministry of Youth' }],
    },
  },
  saude_mental: {
    sugestoes: {
      pt: ['Onde a falta de internet impede acesso a suporte de saúde mental?', 'Que regiões têm maior risco de isolamento social?', 'Onde falta conectividade antes de chegarem programas de saúde mental?'],
      es: ['Dónde la falta de internet impide acceso a soporte de salud mental?', 'Qué regiones tienen mayor riesgo de aislamiento social?', 'Dónde falta conectividad antes de llegar programas de salud mental?'],
      en: ['Where does lack of internet prevent access to mental health support?', 'Which regions have the highest risk of social isolation?', 'Where is connectivity lacking before mental health programs arrive?'],
    },
    resposta: {
      resposta_ia: {
        pt: 'A Zona Urbana Norte tem apenas 30% de cobertura de rede, impossibilitando consultas remotas de saúde mental para 85% da população. O Distrito Industrial Sul, com 75% de cobertura, já consegue oferecer teleatendimento psicológico básico.',
        es: 'La Zona Urbana Norte tiene solo 30% de cobertura de red, imposibilitando consultas remotas de salud mental para 85% de la población. El Distrito Industrial Sur, con 75% de cobertura, ya puede ofrecer teleatención psicológica básica.',
        en: 'The North Urban Zone has only 30% network coverage, making remote mental health consultations impossible for 85% of the population. The South Industrial District, with 75% coverage, can already offer basic psychological telecare.',
      },
      dados: [
        { regiao: { pt: 'Zona Urbana Norte', es: 'Zona Urbana Norte', en: 'North Urban Zone' }, valor: 30, fonte: 'Vísent CDRView' },
        { regiao: { pt: 'Distrito Industrial Sul', es: 'Distrito Industrial Sur', en: 'South Industrial District' }, valor: 75, fonte: 'Vísent CDRView' },
      ],
      fontes: ['Vísent CDRView', { pt: 'OMS', es: 'OMS', en: 'WHO' }],
    },
  },
};

export default function SidebarConsulta({
  servicoAtivo, regiaoAtiva, onRegiaoChange, corBase, idioma,
}) {
  const [query, setQuery] = useState('');
  const [resultado, setResultado] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const t = (obj) => (typeof obj === 'string' ? obj : obj[idioma]);
  const mock = mockPorServico[servicoAtivo];
  const res = mock.resposta;
  const tx = (key) => t(textos[key]);

  function handleSubmit(e) {
    e?.preventDefault();
    if (!query.trim()) return;
    setCarregando(true);
    setTimeout(() => {
      setResultado(mock.resposta);
      setCarregando(false);
    }, 1200);
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-5 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
        <div className="w-full sm:w-auto">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800">{tx('consultaDados')}</h2>
          <p className="text-xs sm:text-sm text-gray-400">{tx('descricao')}</p>
        </div>
        <select
          value={regiaoAtiva}
          onChange={(e) => onRegiaoChange(e.target.value)}
          className="w-full sm:w-auto rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600 outline-none transition focus:border-[#00B4D8]"
        >
          {regioes.map((r) => (
            <option key={r.id} value={r.id}>{t(r.nome)}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span
          className="rounded-full px-2 sm:px-3 py-1 text-[9px] sm:text-[10px] font-medium text-white whitespace-nowrap"
          style={{ backgroundColor: corBase }}
        >
          {t(servicoNomes[servicoAtivo])}
        </span>
        {regiaoAtiva !== 'todas' && (
          <span className="rounded-full bg-gray-100 px-2 sm:px-3 py-1 text-[9px] sm:text-[10px] text-gray-500 whitespace-nowrap">
            {t(regioes.find((r) => r.id === regiaoAtiva)?.nome)}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={mock.sugestoes[idioma][0]}
          className="w-full flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 sm:px-5 py-2.5 sm:py-3 text-sm shadow-sm outline-none transition focus:border-[#00B4D8] focus:bg-white focus:shadow-md"
        />
        <button
          type="submit"
          disabled={carregando || !query.trim()}
          className="w-full sm:w-auto rounded-2xl px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold text-white shadow-sm transition disabled:opacity-50 min-h-[44px]"
          style={{ backgroundColor: corBase }}
        >
          {carregando ? tx('analisando') : tx('consultar')}
        </button>
      </form>

      {!resultado && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {mock.sugestoes[idioma].map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setQuery(s)}
              className="rounded-lg sm:rounded-xl border border-gray-200 bg-gray-50 px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs text-gray-500 transition hover:border-[#00B4D8] hover:bg-blue-50 hover:text-[#00B4D8] text-left leading-snug"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {!resultado && !carregando && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-8 sm:py-16 text-center">
          <div className="mb-3 flex size-10 sm:size-12 items-center justify-center rounded-full bg-gray-100 text-base sm:text-lg text-gray-400 font-mono">
            ?
          </div>
          <p className="text-sm font-medium text-gray-400">{tx('aguardando')}</p>
          <p className="text-xs text-gray-300 px-4">{tx('dica')}</p>
        </div>
      )}

      {carregando && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#00B4D8]/20 py-8 sm:py-16 text-center">
          <div className="mb-4 size-8 sm:size-10 animate-spin rounded-full border-[3px] border-gray-100 border-t-current" style={{ color: corBase }} />
          <p className="text-sm text-gray-500">{tx('processando')}</p>
        </div>
      )}

      {resultado && !carregando && (
        <div className="flex flex-col gap-4 sm:gap-5">
          <div
            className="rounded-2xl px-4 sm:px-5 py-3 sm:py-4"
            style={{ borderLeft: `4px solid ${corBase}`, backgroundColor: `${corBase}10` }}
          >
            <p className="text-xs sm:text-sm leading-relaxed text-gray-700">{t(res.resposta_ia)}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {res.dados.map((item, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm">
                <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-gray-400">{t(item.regiao)}</p>
                <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-800">
                  {item.valor}<span className="text-sm sm:text-base font-normal text-gray-400">%</span>
                </p>
                <div className="mt-3 sm:mt-4 h-1.5 sm:h-2 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(item.valor, 100)}%`, backgroundColor: corBase }} />
                </div>
                <p className="mt-3 sm:mt-4 text-[10px] sm:text-[11px] text-gray-400">{tx('fonte')} {t(item.fonte)}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {res.fontes.map((f, i) => (
              <span key={i} className="rounded-full bg-gray-100 px-2 sm:px-3 py-1 text-[9px] sm:text-[10px] text-gray-500">{t(f)}</span>
            ))}
          </div>

          <button
            type="button"
            onClick={() => { setQuery(''); setResultado(null); }}
            className="self-start rounded-lg sm:rounded-xl border border-gray-200 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-500 transition hover:bg-gray-50 hover:text-gray-700 min-h-[40px]"
          >
            + {tx('novaConsulta')}
          </button>
        </div>
      )}
    </div>
  );
}
