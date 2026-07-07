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

import java.math.BigDecimal;

/**
 * Mapeia a tabela `coverage_points` — as 132 antenas ERB reais
 * (Claro / Anatel) do dataset Vísent CDRView.
 *
 * `technology` e `signalQuality` ficam NULL no MVP — preparados para
 * fontes futuras (ver docs/DATA_CONTRACT.md secção 6).
 */
@Entity
@Table(name = "coverage_points")
public class CoveragePoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ecgi", nullable = false, unique = true)
    private String ecgi;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "region_id", nullable = false)
    private Region region;

    @Column(name = "lat", nullable = false, precision = 10, scale = 6)
    private BigDecimal lat;

    @Column(name = "lng", nullable = false, precision = 10, scale = 6)
    private BigDecimal lng;

    @Column(name = "technology")
    private String technology;

    @Column(name = "signal_quality", precision = 5, scale = 2)
    private BigDecimal signalQuality;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_id")
    private Source source;

    public CoveragePoint() {
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getEcgi() {
        return ecgi;
    }

    public void setEcgi(String ecgi) {
        this.ecgi = ecgi;
    }

    public Region getRegion() {
        return region;
    }

    public void setRegion(Region region) {
        this.region = region;
    }

    public BigDecimal getLat() {
        return lat;
    }

    public void setLat(BigDecimal lat) {
        this.lat = lat;
    }

    public BigDecimal getLng() {
        return lng;
    }

    public void setLng(BigDecimal lng) {
        this.lng = lng;
    }

    public String getTechnology() {
        return technology;
    }

    public void setTechnology(String technology) {
        this.technology = technology;
    }

    public BigDecimal getSignalQuality() {
        return signalQuality;
    }

    public void setSignalQuality(BigDecimal signalQuality) {
        this.signalQuality = signalQuality;
    }

    public Source getSource() {
        return source;
    }

    public void setSource(Source source) {
        this.source = source;
    }
}
