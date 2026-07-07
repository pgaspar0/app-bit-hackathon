package com.bitapp.backend.repository;

import com.bitapp.backend.entity.CoveragePoint;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Sem métodos customizados ainda — nenhum endpoint do MVP consome
 * coverage_points directamente (o número de antenas por cluster é obtido
 * via o indicador 'antenas_por_cluster' em observations, não daqui).
 * Fica pronta para quando for preciso, ex: detalhar antenas de uma região.
 */
public interface CoveragePointRepository extends JpaRepository<CoveragePoint, Integer> {
}
