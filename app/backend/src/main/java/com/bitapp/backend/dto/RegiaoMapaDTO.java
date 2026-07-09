package com.bitapp.backend.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Um item da lista "regioes" em GET /mapa. Note que aqui o campo chama-se
 * "regiao" (não "cluster_code") — segue exactamente o exemplo da
 * arquitectura original do produto (docs/arquitecture.md secção 8).
 * coberturaRede -> cobertura_rede via Jackson SNAKE_CASE global.
 */
public class RegiaoMapaDTO {

    private String regiao;
    private BigDecimal lat;
    private BigDecimal lng;
    private BigDecimal concentracao;
    private BigDecimal coberturaRede;
    private BigDecimal valor;
    private String indicador;
    private boolean semCobertura;
    private List<String> indicadores;

    public RegiaoMapaDTO() {
    }

    public RegiaoMapaDTO(String regiao, BigDecimal lat, BigDecimal lng,
                          BigDecimal concentracao, BigDecimal coberturaRede,
                          BigDecimal valor, String indicador,
                          boolean semCobertura, List<String> indicadores) {
        this.regiao = regiao;
        this.lat = lat;
        this.lng = lng;
        this.concentracao = concentracao;
        this.coberturaRede = coberturaRede;
        this.valor = valor;
        this.indicador = indicador;
        this.semCobertura = semCobertura;
        this.indicadores = indicadores;
    }

    public String getRegiao() {
        return regiao;
    }

    public void setRegiao(String regiao) {
        this.regiao = regiao;
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

    public BigDecimal getConcentracao() {
        return concentracao;
    }

    public void setConcentracao(BigDecimal concentracao) {
        this.concentracao = concentracao;
    }

    public BigDecimal getCoberturaRede() {
        return coberturaRede;
    }

    public void setCoberturaRede(BigDecimal coberturaRede) {
        this.coberturaRede = coberturaRede;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public String getIndicador() {
        return indicador;
    }

    public void setIndicador(String indicador) {
        this.indicador = indicador;
    }

    public boolean isSemCobertura() {
        return semCobertura;
    }

    public void setSemCobertura(boolean semCobertura) {
        this.semCobertura = semCobertura;
    }

    public List<String> getIndicadores() {
        return indicadores;
    }

    public void setIndicadores(List<String> indicadores) {
        this.indicadores = indicadores;
    }
}
