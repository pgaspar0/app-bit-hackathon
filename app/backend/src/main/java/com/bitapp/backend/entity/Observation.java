package com.bitapp.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Mapeia a tabela `observations` — a tabela central do sistema de
 * indicadores. Uma linha = o valor de um indicador, numa região, numa
 * data e período específicos.
 *
 * `period` é sempre preenchido (nunca NULL) — usa 'ALL' para indicadores
 * sem variação por período do dia (ex: antenas_por_cluster). Isto existe
 * porque a UNIQUE constraint (region_id, indicator_id, obs_date, period)
 * falharia silenciosamente com NULL, já que NULL != NULL em SQL.
 */
@Entity
@Table(name = "observations")
public class Observation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "region_id", nullable = false)
    private Region region;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "indicator_id", nullable = false)
    private Indicator indicator;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_id", nullable = false)
    private Source source;

    @Column(name = "obs_date", nullable = false)
    private LocalDate obsDate;

    @Column(name = "period", nullable = false)
    private String period;

    @Column(name = "obs_value", nullable = false, precision = 15, scale = 4)
    private BigDecimal obsValue;

    @Column(name = "unit")
    private String unit;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "jsonb")
    private String metadata;

    public Observation() {
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Region getRegion() {
        return region;
    }

    public void setRegion(Region region) {
        this.region = region;
    }

    public Indicator getIndicator() {
        return indicator;
    }

    public void setIndicator(Indicator indicator) {
        this.indicator = indicator;
    }

    public Source getSource() {
        return source;
    }

    public void setSource(Source source) {
        this.source = source;
    }

    public LocalDate getObsDate() {
        return obsDate;
    }

    public void setObsDate(LocalDate obsDate) {
        this.obsDate = obsDate;
    }

    public String getPeriod() {
        return period;
    }

    public void setPeriod(String period) {
        this.period = period;
    }

    public BigDecimal getObsValue() {
        return obsValue;
    }

    public void setObsValue(BigDecimal obsValue) {
        this.obsValue = obsValue;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }
}
