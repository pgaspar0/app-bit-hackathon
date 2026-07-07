package com.bitapp.backend.repository;

import com.bitapp.backend.entity.Program;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Tabela vazia no MVP. Pronta para os serviços de Formações, Experiências
 * Estruturantes e Mentorias assim que houver fontes públicas externas.
 */
public interface ProgramRepository extends JpaRepository<Program, Integer> {
}
