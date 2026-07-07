package com.bitapp.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;

/**
 * Mapeia a tabela `regions` — a unidade geográfica base do sistema.
 *
 * IMPORTANTE: `lat` e `lng` podem ser NULL. Isso representa clusters sem
 * cobertura de rede (existem em assinantes.csv mas não em antenas_flp.csv).
 * Não é um erro de dados — é um dado de produto.
 */
@Entity
@Table(name = "regions")
public class Region {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "cluster_code", nullable = false, unique = true)
    private String clusterCode;

    @Column(name = "municipio", nullable = false)
    private String municipio;

    @Column(name = "country", nullable = false)
    private String country;

    @Column(name = "lat", precision = 10, scale = 6)
    private BigDecimal lat;

    @Column(name = "lng", precision = 10, scale = 6)
    private BigDecimal lng;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "jsonb")
    private String metadata;

    public Region() {
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getClusterCode() {
        return clusterCode;
    }

    public void setClusterCode(String clusterCode) {
        this.clusterCode = clusterCode;
    }

    public String getMunicipio() {
        return municipio;
    }

    public void setMunicipio(String municipio) {
        this.municipio = municipio;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
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

    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }
}
