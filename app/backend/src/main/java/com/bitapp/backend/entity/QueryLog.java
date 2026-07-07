package com.bitapp.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

/**
 * Mapeia a tabela `query_logs`. Esta é a ÚNICA tabela em que este backend
 * escreve — todas as outras são populadas pelo pipeline Python
 * (app/data/ingest.py) e o backend só as lê.
 *
 * `createdAt` usa @CreationTimestamp para que o Hibernate preencha o valor
 * em memória no momento do insert. Isto é necessário porque, apesar da
 * coluna ter DEFAULT NOW() no schema, o Hibernate inclui todos os campos
 * mapeados no INSERT — sem @CreationTimestamp, gravaria NULL e ignoraria
 * o default da base de dados.
 */
@Entity
@Table(name = "query_logs")
public class QueryLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_query", nullable = false)
    private String userQuery;

    @Column(name = "normalized_query")
    private String normalizedQuery;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "filters", columnDefinition = "jsonb")
    private String filters;

    @Column(name = "result_summary")
    private String resultSummary;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public QueryLog() {
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getUserQuery() {
        return userQuery;
    }

    public void setUserQuery(String userQuery) {
        this.userQuery = userQuery;
    }

    public String getNormalizedQuery() {
        return normalizedQuery;
    }

    public void setNormalizedQuery(String normalizedQuery) {
        this.normalizedQuery = normalizedQuery;
    }

    public String getFilters() {
        return filters;
    }

    public void setFilters(String filters) {
        this.filters = filters;
    }

    public String getResultSummary() {
        return resultSummary;
    }

    public void setResultSummary(String resultSummary) {
        this.resultSummary = resultSummary;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
