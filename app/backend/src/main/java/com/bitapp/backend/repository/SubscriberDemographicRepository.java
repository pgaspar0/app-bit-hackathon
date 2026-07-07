package com.bitapp.backend.repository;

import com.bitapp.backend.entity.SubscriberDemographic;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Sem endpoint dedicado no MVP. Pronta para o dia em que os serviços de
 * Empregabilidade/Formação precisarem de perfil demográfico por região
 * (ver docs/DATA_CONTRACT.md secção 4.3 para uma query de referência).
 */
public interface SubscriberDemographicRepository extends JpaRepository<SubscriberDemographic, Integer> {
}
