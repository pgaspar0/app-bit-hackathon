package com.bitapp.backend.repository;

import com.bitapp.backend.entity.Region;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RegionRepository extends JpaRepository<Region, Integer> {

    Optional<Region> findByClusterCode(String clusterCode);

    List<Region> findAllByOrderByMunicipioAscClusterCodeAsc();

    /**
     * Usada por POST /dados: o filtro "regiao" pode vir como cluster_code
     * (ex: 'UFSC') ou como municipio (ex: 'FLORIANOPOLIS') — tenta os dois.
     */
    @Query("""
            SELECT r FROM Region r
            WHERE UPPER(r.clusterCode) = UPPER(:valor)
               OR UPPER(r.municipio) = UPPER(:valor)
            """)
    List<Region> findByClusterCodeOrMunicipioIgnoreCase(@Param("valor") String valor);
}
