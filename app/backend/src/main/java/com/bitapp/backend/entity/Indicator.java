package com.bitapp.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Mapeia a tabela `indicators` — o catálogo de métricas disponíveis no
 * sistema (ex: n_usuarios, congestionamento, download_bytes_gb,
 * antenas_por_cluster). Ver docs/DATA_CONTRACT.md secção 3.2.
 */
@Entity
@Table(name = "indicators")
public class Indicator {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "indicator_name", nullable = false, unique = true)
    private String indicatorName;

    @Column(name = "category", nullable = false)
    private String category;

    @Column(name = "unit")
    private String unit;

    @Column(name = "description")
    private String description;

    @Column(name = "source_type")
    private String sourceType;

    public Indicator() {
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getIndicatorName() {
        return indicatorName;
    }

    public void setIndicatorName(String indicatorName) {
        this.indicatorName = indicatorName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSourceType() {
        return sourceType;
    }

    public void setSourceType(String sourceType) {
        this.sourceType = sourceType;
    }
}
