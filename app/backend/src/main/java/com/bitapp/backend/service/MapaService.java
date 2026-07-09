package com.bitapp.backend.service;

import com.bitapp.backend.dto.MapaResponseDTO;
import com.bitapp.backend.dto.RegiaoMapaDTO;
import com.bitapp.backend.entity.Region;
import com.bitapp.backend.repository.ObservationRepository;
import com.bitapp.backend.repository.ObservationRepository.RegionIndicatorProjection;
import com.bitapp.backend.repository.ObservationRepository.RegionValueProjection;
import com.bitapp.backend.repository.RegionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Monta a resposta de GET /mapa. Regras de preenchimento (ver
 * docs/DATA_CONTRACT.md secção 5 e PROMPT_BACKEND.md secção 8.3):
 *
 *  - concentracao    = último valor de n_usuarios, período TARDE.
 *  - cobertura_rede  = valor de antenas_por_cluster (período ALL,
 *                       indicador sem variação por período do dia).
 *  - indicadores     = nomes distintos dos indicadores com pelo menos
 *                       uma observação gravada para a região.
 *  - Regiões sem observação para um indicador recebem 0 (não são omitidas).
 *  - Regiões com lat/lng NULL entram na lista com sem_cobertura=true.
 */
@Service
public class MapaService {

    private static final String INDICADOR_CONCENTRACAO = "n_usuarios";
    private static final String PERIODO_CONCENTRACAO = "TARDE";

    private static final String INDICADOR_COBERTURA = "antenas_por_cluster";
    private static final String PERIODO_SEM_VARIACAO = "ALL";

    private final RegionRepository regionRepository;
    private final ObservationRepository observationRepository;

    public MapaService(RegionRepository regionRepository, ObservationRepository observationRepository) {
        this.regionRepository = regionRepository;
        this.observationRepository = observationRepository;
    }

    public MapaResponseDTO gerarMapa(String servico, String indicador) {
        List<Region> regioes = regionRepository.findAll();

        Map<Integer, BigDecimal> concentracaoPorRegiao = mapaDeValores(
                observationRepository.findLatestValuePerRegion(INDICADOR_CONCENTRACAO, PERIODO_CONCENTRACAO));

        Map<Integer, BigDecimal> coberturaPorRegiao = mapaDeValores(
                observationRepository.findLatestValuePerRegion(INDICADOR_COBERTURA, PERIODO_SEM_VARIACAO));

        Map<Integer, RegionValueProjection> leituraAtiva = leituraAtiva(servico, indicador);

        Map<Integer, List<String>> indicadoresPorRegiao = observationRepository
                .findDistinctIndicatorsByRegion()
                .stream()
                .collect(Collectors.groupingBy(
                        RegionIndicatorProjection::getRegionId,
                        Collectors.mapping(RegionIndicatorProjection::getIndicatorName, Collectors.toList())));

        List<RegiaoMapaDTO> regioesDTO = regioes.stream()
                .map(r -> {
                    RegionValueProjection valorAtivo = leituraAtiva.get(r.getId());
                    return new RegiaoMapaDTO(
                        r.getClusterCode(),
                        r.getLat(),
                        r.getLng(),
                        concentracaoPorRegiao.getOrDefault(r.getId(), BigDecimal.ZERO),
                        coberturaPorRegiao.getOrDefault(r.getId(), BigDecimal.ZERO),
                        valorAtivo != null ? valorAtivo.getObsValue() : null,
                        valorAtivo != null ? valorAtivo.getIndicatorName() : null,
                        r.getLat() == null || r.getLng() == null,
                        indicadoresPorRegiao.getOrDefault(r.getId(), List.of()));
                })
                .collect(Collectors.toList());

        return new MapaResponseDTO(regioesDTO);
    }

    public MapaResponseDTO gerarMapa() {
        return gerarMapa(null, null);
    }

    private Map<Integer, RegionValueProjection> leituraAtiva(String servico, String indicador) {
        List<String> candidatos = candidatosMapa(servico, indicador);
        for (String candidato : candidatos) {
            Map<Integer, RegionValueProjection> valores = observationRepository
                    .findLatestValuePerRegionByIndicatorOrCategory(candidato)
                    .stream()
                    .collect(Collectors.toMap(
                            RegionValueProjection::getRegionId,
                            projection -> projection,
                            (first, ignored) -> first));
            if (!valores.isEmpty()) {
                return valores;
            }
        }
        return new HashMap<>();
    }

    private List<String> candidatosMapa(String servico, String indicador) {
        if (indicador != null && !indicador.isBlank()) {
            return List.of(indicador.trim());
        }

        String id = servico == null ? "" : servico.trim().toLowerCase();
        return switch (id) {
            case "formacoes" -> List.of("formacao", "antenas_por_cluster", "conectividade");
            case "empregabilidade" -> List.of("emprego", "n_usuarios", "mobilidade");
            case "experiencias" -> List.of("estrutura_social", "n_usuarios", "mobilidade");
            case "mentorias" -> List.of("mentoria", "n_usuarios", "mobilidade");
            case "saude_mental" -> List.of("saude_mental", "congestionamento", "conectividade");
            default -> List.of("n_usuarios", "mobilidade", "conectividade");
        };
    }

    private Map<Integer, BigDecimal> mapaDeValores(List<RegionValueProjection> projecoes) {
        return projecoes.stream()
                .collect(Collectors.toMap(
                        RegionValueProjection::getRegionId,
                        RegionValueProjection::getObsValue));
    }
}
