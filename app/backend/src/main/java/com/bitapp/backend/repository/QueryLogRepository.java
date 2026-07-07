package com.bitapp.backend.repository;

import com.bitapp.backend.entity.QueryLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QueryLogRepository extends JpaRepository<QueryLog, Integer> {
}
