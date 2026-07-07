package com.bitapp.backend.repository;

import com.bitapp.backend.entity.Indicator;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface IndicatorRepository extends JpaRepository<Indicator, Integer> {

    Optional<Indicator> findByIndicatorName(String indicatorName);

    List<Indicator> findByCategoryIgnoreCase(String category);

    List<Indicator> findAllByOrderByCategoryAscIndicatorNameAsc();
}
