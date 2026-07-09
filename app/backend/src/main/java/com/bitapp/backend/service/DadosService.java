package com.bitapp.backend.service;

import com.bitapp.backend.dto.DadoItemDTO;
import com.bitapp.backend.dto.DadosEstatisticasDTO;
import com.bitapp.backend.dto.DadosRequestDTO;
import com.bitapp.backend.dto.DadosResponseDTO;
import com.bitapp.backend.entity.Observation;
import com.bitapp.backend.entity.QueryLog;
import com.bitapp.backend.repository.ObservationRepository;
import com.bitapp.backend.repository.QueryLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DadosService {

    private static final Logger log = LoggerFactory.getLogger(DadosService.class);

    /** Limite de segurança — evita devolver milhares de linhas numa consulta sem filtros. */
    private static final int LIMITE_RESULTADOS = 50;

    private final ObservationRepository observationRepository;
    private final QueryLogRepository queryLogRepository;
    private final QueryInterpreterRouter queryInterpreter;
    private final ObjectMapper objectMapper;

    public DadosService(ObservationRepository observationRepository,
                         QueryLogRepository queryLogRepository,
                         QueryInterpreterRouter queryInterpreter,
                         ObjectMapper objectMapper) {
        this.observationRepository = observationRepository;
        this.queryLogRepository = queryLogRepository;
        this.queryInterpreter = queryInterpreter;
        this.objectMapper = objectMapper;
    }

    public DadosResponseDTO processarConsulta(DadosRequestDTO request) {
        String regiao = request.getFiltros() != null ? request.getFiltros().getRegiao() : null;
        String indicador = request.getFiltros() != null ? request.getFiltros().getIndicador() : null;
        String servico = request.getFiltros() != null ? request.getFiltros().getServico() : null;
        String idioma = (request.getIdioma() == null || request.getIdioma().isBlank())
                ? "pt" : request.getIdioma();
        ServiceContext contexto = ServiceContext.from(servico, indicador);

        registarConsulta(request);

        List<Observation> observacoes = buscarObservacoes(
                normalizarFiltro(regiao),
                normalizarFiltro(indicador),
                contexto);

        List<DadoItemDTO> dados = observacoes.stream()
                .map(o -> new DadoItemDTO(
                        o.getRegion().getClusterCode(),
                        o.getRegion().getMunicipio(),
                        o.getIndicator().getIndicatorName(),
                        o.getObsValue(),
                        o.getSource().getSourceName(),
                        o.getObsDate(),
                        o.getUnit(),
                        o.getRegion().getLat(),
                        o.getRegion().getLng(),
                        o.getRegion().getLat() == null || o.getRegion().getLng() == null))
                .collect(Collectors.toList());

        Map<String, DadoItemDTO> snapshotsPorRegiao = new LinkedHashMap<>();
        for (DadoItemDTO item : dados) {
            snapshotsPorRegiao.putIfAbsent(item.getRegiao(), item);
        }

        List<DadoItemDTO> topRegioes = ordenarPrioridade(snapshotsPorRegiao, contexto);

        DadosEstatisticasDTO estatisticas = calcularEstatisticas(dados, snapshotsPorRegiao);
        String prioridadeIntervencao = classificarPrioridade(estatisticas, topRegioes, contexto);
        String resumoExecutivo = construirResumoExecutivo(estatisticas, topRegioes, contexto);
        String recomendacao = construirRecomendacao(estatisticas, topRegioes, prioridadeIntervencao, idioma, contexto);

        List<String> fontes = dados.stream()
                .map(DadoItemDTO::getFonte)
                .distinct()
                .collect(Collectors.toList());

        String respostaIa = queryInterpreter.gerarResposta(
                request.getConsulta(),
                topRegioes.isEmpty() ? dados : topRegioes,
                idioma);

        return new DadosResponseDTO(
            respostaIa,
            resumoExecutivo,
            prioridadeIntervencao,
            recomendacao,
            estatisticas,
            topRegioes,
            dados,
            fontes);
    }

    private List<Observation> buscarObservacoes(String regiao, String indicador, ServiceContext contexto) {
        if (indicador != null) {
            return observationRepository.buscarComFiltros(regiao, indicador, PageRequest.of(0, LIMITE_RESULTADOS));
        }

        for (String indicadorOuCategoria : contexto.indicadoresOuCategorias()) {
            List<Observation> encontrados = observationRepository.buscarComFiltros(
                    regiao,
                    indicadorOuCategoria,
                    PageRequest.of(0, LIMITE_RESULTADOS));
            if (!encontrados.isEmpty()) {
                return encontrados;
            }
        }

        return observationRepository.buscarComFiltros(regiao, null, PageRequest.of(0, LIMITE_RESULTADOS));
    }

    /** Um filtro em branco ("") deve ser tratado como ausente (null), não como um valor literal. */
    private String normalizarFiltro(String valor) {
        return (valor == null || valor.isBlank()) ? null : valor.trim();
    }

    /**
     * Regista a consulta em query_logs. Nunca deve bloquear a resposta ao
     * utilizador — se a escrita do log falhar por alguma razão, seguimos
     * em frente e apenas registamos um aviso.
     */
    private void registarConsulta(DadosRequestDTO request) {
        try {
            QueryLog entry = new QueryLog();
            entry.setUserQuery(request.getConsulta());
            entry.setNormalizedQuery(request.getConsulta().trim().toUpperCase());
            entry.setFilters(objectMapper.writeValueAsString(request.getFiltros()));
            queryLogRepository.save(entry);
        } catch (Exception e) {
            log.warn("Não foi possível registar a consulta em query_logs: {}", e.getMessage());
        }
    }

    private DadosEstatisticasDTO calcularEstatisticas(List<DadoItemDTO> dados,
                                                      Map<String, DadoItemDTO> snapshotsPorRegiao) {
        if (dados.isEmpty()) {
            return new DadosEstatisticasDTO(0, 0, null, null, null, null);
        }

        List<BigDecimal> valores = snapshotsPorRegiao.values().stream()
                .map(DadoItemDTO::getValor)
                .filter(valor -> valor != null)
                .toList();

        BigDecimal soma = valores.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal media = valores.isEmpty()
                ? null
                : soma.divide(BigDecimal.valueOf(valores.size()), 2, RoundingMode.HALF_UP);

        BigDecimal minimo = valores.stream().min(Comparator.naturalOrder()).orElse(null);
        BigDecimal maximo = valores.stream().max(Comparator.naturalOrder()).orElse(null);
        String regiaoDestaque = snapshotsPorRegiao.values().stream()
                .max(Comparator.comparing(DadoItemDTO::getValor))
                .map(DadoItemDTO::getRegiao)
                .orElse(null);

        return new DadosEstatisticasDTO(
                dados.size(),
                snapshotsPorRegiao.size(),
                media,
                minimo,
                maximo,
                regiaoDestaque);
    }

    private List<DadoItemDTO> ordenarPrioridade(Map<String, DadoItemDTO> snapshotsPorRegiao, ServiceContext contexto) {
        Comparator<DadoItemDTO> porValor = Comparator.comparing(
                DadoItemDTO::getValor,
                Comparator.nullsLast(Comparator.naturalOrder()));

        if (!contexto.menorValorIndicaPrioridade()) {
            porValor = porValor.reversed();
        }

        return snapshotsPorRegiao.values().stream()
                .sorted(porValor.thenComparing(DadoItemDTO::getRegiao, Comparator.nullsLast(Comparator.naturalOrder())))
                .limit(5)
                .collect(Collectors.toList());
    }

    private String classificarPrioridade(DadosEstatisticasDTO estatisticas, List<DadoItemDTO> topRegioes,
                                         ServiceContext contexto) {
        if (estatisticas == null || estatisticas.getValorMaximo() == null || estatisticas.getValorMedio() == null) {
            return "SEM_DADOS";
        }

        BigDecimal referencia = contexto.menorValorIndicaPrioridade()
                ? estatisticas.getValorMinimo()
                : estatisticas.getValorMaximo();

        if (referencia == null || topRegioes.isEmpty()) {
            return "SEM_DADOS";
        }

        if (contexto.menorValorIndicaPrioridade()) {
            if (referencia.compareTo(estatisticas.getValorMedio().multiply(BigDecimal.valueOf(0.55))) <= 0) {
                return "ALTA";
            }
            if (referencia.compareTo(estatisticas.getValorMedio().multiply(BigDecimal.valueOf(0.80))) <= 0) {
                return "MEDIA";
            }
            return "BAIXA";
        }

        if (topRegioes.size() >= 3
                && referencia.compareTo(estatisticas.getValorMedio().multiply(BigDecimal.valueOf(1.5))) >= 0) {
            return "ALTA";
        }

        if (referencia.compareTo(estatisticas.getValorMedio().multiply(BigDecimal.valueOf(1.2))) >= 0) {
            return "MEDIA";
        }

        return "BAIXA";
    }

    private String construirResumoExecutivo(DadosEstatisticasDTO estatisticas, List<DadoItemDTO> topRegioes,
                                            ServiceContext contexto) {
        if (estatisticas == null || estatisticas.getTotalRegistros() == null || estatisticas.getTotalRegistros() == 0) {
            return "Não foram encontrados dados para os filtros indicados nesta consulta.";
        }

        String regiao = topRegioes.isEmpty() ? "a região principal" : topRegioes.get(0).getRegiao();
        String valor = topRegioes.isEmpty() || topRegioes.get(0).getValor() == null
                ? "sem valor numérico"
                : topRegioes.get(0).getValor().stripTrailingZeros().toPlainString();
        String criterio = contexto.menorValorIndicaPrioridade()
                ? "menor valor observado, sinalizando lacuna de cobertura/oferta"
                : "maior valor observado, sinalizando concentração ou pressão territorial";

        return String.format(
                "A consulta devolveu %d registos em %d regiões. Para %s, a região prioritária é %s, com valor %s pelo critério de %s.",
                estatisticas.getTotalRegistros(),
                estatisticas.getTotalRegioes(),
                contexto.nomePublico(),
                regiao,
                valor,
                criterio);
    }

    private String construirRecomendacao(DadosEstatisticasDTO estatisticas, List<DadoItemDTO> topRegioes,
                                         String prioridadeIntervencao, String idioma, ServiceContext contexto) {
        if (estatisticas == null || estatisticas.getTotalRegistros() == null || estatisticas.getTotalRegistros() == 0) {
            return idioma != null && idioma.startsWith("es")
                    ? "No hay datos suficientes para generar una recomendación confiable."
                    : idioma != null && idioma.startsWith("en")
                    ? "There is not enough data to produce a reliable recommendation."
                    : "Não há dados suficientes para gerar uma recomendação confiável.";
        }

        String regiao = topRegioes.isEmpty() ? "a região de maior valor" : topRegioes.get(0).getRegiao();
        String valor = topRegioes.isEmpty() || topRegioes.get(0).getValor() == null
                ? "o valor de referência"
                : topRegioes.get(0).getValor().stripTrailingZeros().toPlainString();

        return String.format(
                "Prioridade %s em %s: use %s como ponto de partida para aprofundar a análise, validar capacidade local e comparar a diferença entre regiões com base no valor %s.",
                prioridadeIntervencao.toLowerCase(),
                contexto.nomePublico(),
                regiao,
                valor);
    }

    private record ServiceContext(String id, String nomePublico, List<String> indicadoresOuCategorias,
                                  boolean menorValorIndicaPrioridade) {
        static ServiceContext from(String servico, String indicadorExplicito) {
            if (indicadorExplicito != null && !indicadorExplicito.isBlank()) {
                return new ServiceContext("custom", "indicador selecionado",
                        List.of(indicadorExplicito.trim()), false);
            }

            String id = servico == null ? "" : servico.trim().toLowerCase();
            return switch (id) {
                case "formacoes" -> new ServiceContext(id, "Formações",
                        List.of("formacao", "antenas_por_cluster", "conectividade"), true);
                case "empregabilidade" -> new ServiceContext(id, "Empregabilidade",
                        List.of("emprego", "n_usuarios", "mobilidade"), false);
                case "experiencias" -> new ServiceContext(id, "Experiências Estruturantes",
                        List.of("estrutura_social", "n_usuarios", "mobilidade"), false);
                case "mentorias" -> new ServiceContext(id, "Mentorias",
                        List.of("mentoria", "n_usuarios", "mobilidade"), false);
                case "saude_mental" -> new ServiceContext(id, "Saúde Mental",
                        List.of("saude_mental", "congestionamento", "conectividade"), false);
                default -> new ServiceContext("geral", "análise territorial",
                        List.of("mobilidade", "conectividade"), false);
            };
        }
    }
}
