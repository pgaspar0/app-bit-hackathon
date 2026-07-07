package com.bitapp.backend.repository;

import com.bitapp.backend.entity.OdFlow;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Sem endpoint dedicado no MVP. Pronta para quando o produto precisar de
 * mostrar fluxos de mobilidade entre regiões (ver docs/DATA_CONTRACT.md
 * secção 4.4 para uma query de referência sobre fluxos de saída).
 */
public interface OdFlowRepository extends JpaRepository<OdFlow, Integer> {
}
