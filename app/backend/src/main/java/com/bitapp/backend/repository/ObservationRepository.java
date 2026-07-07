package com.bitapp.backend.repository;

import com.bitapp.backend.entity.Observation;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

/**
 * Repositório da tabela central do sistema. As duas queries nativas usam
 * DISTINCT ON do PostgreSQL — a forma idiomática de obter "o registo mais
 * recente por grupo" numa única instrução, sem sub-queries aninhadas.
 */
public interface ObservationRepository extends JpaRepository<Observation, Integer> {

    /**
     * Último valor (data mais recente) de um indicador, por região, para
     * um período específico. Usado por GET /mapa para "concentracao"
     * (n_usuarios, período TARDE) e "cobertura_rede" (antenas_por_cluster,
     * período ALL).
     */
    @Query(value = """
            SELECT DISTINCT ON (o.region_id) o.region_id AS regionId, o.obs_value AS obsValue
            FROM observations o
            JOIN indicators i ON i.id = o.indicator_id
            WHERE i.indicator_name = :indicatorName
              AND o.period = :period
            ORDER BY o.region_id, o.obs_date DESC
            """, nativeQuery = true)
    List<RegionValueProjection> findLatestValuePerRegion(
            @Param("indicatorName") String indicatorName,
            @Param("period") String period);

    /**
     * Todos os pares (região, indicador) com pelo menos uma observação
     * gravada. Usado por GET /mapa para preencher o campo "indicadores"
     * de cada região.
     */
    @Query(value = """
            SELECT DISTINCT o.region_id AS regionId, i.indicator_name AS indicatorName
            FROM observations o
            JOIN indicators i ON i.id = o.indicator_id
            """, nativeQuery = true)
    List<RegionIndicatorProjection> findDistinctIndicatorsByRegion();

    /**
     * Observações filtradas por região e/ou indicador — ambos opcionais.
     * "regiao" aceita cluster_code ou municipio. "indicador" aceita
     * indicator_name ou category. Quando um parâmetro vem null, o filtro
     * correspondente é ignorado (o padrão ":param IS NULL OR ..." é a
     * forma idiomática de filtros opcionais em JPQL).
     *
     * JOIN FETCH traz região, indicador e fonte na mesma query — evita
     * N+1 selects ao construir o DadoItemDTO no service.
     */
    @Query("""
            SELECT o FROM Observation o
            JOIN FETCH o.region r
            JOIN FETCH o.indicator i
            JOIN FETCH o.source s
            WHERE (:regiao IS NULL
                   OR UPPER(r.clusterCode) = UPPER(:regiao)
                   OR UPPER(r.municipio) = UPPER(:regiao))
              AND (:indicador IS NULL
                   OR UPPER(i.indicatorName) = UPPER(:indicador)
                   OR UPPER(i.category) = UPPER(:indicador))
            ORDER BY o.obsDate DESC
            """)
    List<Observation> buscarComFiltros(
            @Param("regiao") String regiao,
            @Param("indicador") String indicador,
            Pageable pageable);

    interface RegionValueProjection {
        Integer getRegionId();

        BigDecimal getObsValue();
    }

    interface RegionIndicatorProjection {
        Integer getRegionId();

        String getIndicatorName();
    }
}
