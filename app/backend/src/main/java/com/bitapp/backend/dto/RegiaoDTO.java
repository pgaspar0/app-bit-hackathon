package com.bitapp.backend.dto;

import java.math.BigDecimal;

/**
 * Resposta de GET /regioes. Serializa com Jackson SNAKE_CASE:
 * clusterCode -> cluster_code, semCobertura -> sem_cobertura.
 */
public class RegiaoDTO {

    private Integer id;
    private String clusterCode;
    private String municipio;
    private BigDecimal lat;
    private BigDecimal lng;
    private boolean semCobertura;

    public RegiaoDTO() {
    }

    public RegiaoDTO(Integer id, String clusterCode, String municipio,
                      BigDecimal lat, BigDecimal lng, boolean semCobertura) {
        this.id = id;
        this.clusterCode = clusterCode;
        this.municipio = municipio;
        this.lat = lat;
        this.lng = lng;
        this.semCobertura = semCobertura;
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

    public boolean isSemCobertura() {
        return semCobertura;
    }

    public void setSemCobertura(boolean semCobertura) {
        this.semCobertura = semCobertura;
    }
}
