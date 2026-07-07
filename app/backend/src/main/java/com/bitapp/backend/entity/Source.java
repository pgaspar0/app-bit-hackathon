package com.bitapp.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Mapeia a tabela `sources`.
 *
 * Só é populada pelo pipeline Python (app/data/ingest.py) — o backend
 * nunca insere nem altera fontes, apenas lê (via Observation.getSource()
 * ou CoveragePoint.getSource()).
 */
@Entity
@Table(name = "sources")
public class Source {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "source_name", nullable = false, unique = true)
    private String sourceName;

    @Column(name = "source_type", nullable = false)
    private String sourceType;

    @Column(name = "url")
    private String url;

    @Column(name = "reliability_score", precision = 3, scale = 2)
    private BigDecimal reliabilityScore;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Source() {
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getSourceName() {
        return sourceName;
    }

    public void setSourceName(String sourceName) {
        this.sourceName = sourceName;
    }

    public String getSourceType() {
        return sourceType;
    }

    public void setSourceType(String sourceType) {
        this.sourceType = sourceType;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public BigDecimal getReliabilityScore() {
        return reliabilityScore;
    }

    public void setReliabilityScore(BigDecimal reliabilityScore) {
        this.reliabilityScore = reliabilityScore;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
