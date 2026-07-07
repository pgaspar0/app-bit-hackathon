package com.bitapp.backend.service;

import com.bitapp.backend.dto.DadoItemDTO;
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

import java.util.List;
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
        String idioma = (request.getIdioma() == null || request.getIdioma().isBlank())
                ? "pt" : request.getIdioma();

        registarConsulta(request);

        List<Observation> observacoes = observationRepository.buscarComFiltros(
                normalizarFiltro(regiao), normalizarFiltro(indicador),
                PageRequest.of(0, LIMITE_RESULTADOS));

        List<DadoItemDTO> dados = observacoes.stream()
                .map(o -> new DadoItemDTO(
                        o.getRegion().getClusterCode(),
                        o.getObsValue(),
                        o.getSource().getSourceName()))
                .collect(Collectors.toList());

        List<String> fontes = dados.stream()
                .map(DadoItemDTO::getFonte)
                .distinct()
                .collect(Collectors.toList());

        String respostaIa = queryInterpreter.gerarResposta(request.getConsulta(), dados, idioma);

        return new DadosResponseDTO(respostaIa, dados, fontes);
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
}
