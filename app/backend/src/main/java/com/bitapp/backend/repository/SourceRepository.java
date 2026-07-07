package com.bitapp.backend.repository;

import com.bitapp.backend.entity.Source;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SourceRepository extends JpaRepository<Source, Integer> {

    Optional<Source> findBySourceName(String sourceName);
}
