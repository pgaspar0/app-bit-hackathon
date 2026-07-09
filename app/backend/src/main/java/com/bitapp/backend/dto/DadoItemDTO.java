package com.bitapp.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Um item do array "dados" em POST /dados.
 * Os campos adicionais ajudam o frontend a funcionar com qualquer tipo de
 * fonte/região, sem depender de uma cidade ou dataset específico.
 */
public class DadoItemDTO {

    private String regiao;
    private String municipio;
    private String indicador;
    private BigDecimal valor;
    private String fonte;
    private LocalDate dataReferencia;
    private String unidade;
    private BigDecimal lat;
    private BigDecimal lng;
    private boolean semCobertura;

    public DadoItemDTO() {
    }

    public DadoItemDTO(String regiao, String municipio, String indicador,
                       BigDecimal valor, String fonte,
                       LocalDate dataReferencia, String unidade,
                       BigDecimal lat, BigDecimal lng, boolean semCobertura) {
        this.regiao = regiao;
        this.municipio = municipio;
        this.indicador = indicador;
        this.valor = valor;
        this.fonte = fonte;
        this.dataReferencia = dataReferencia;
        this.unidade = unidade;
        this.lat = lat;
        this.lng = lng;
        this.semCobertura = semCobertura;
    }

    public String getRegiao() {
        return regiao;
    }

    public void setRegiao(String regiao) {
        this.regiao = regiao;
    }

    public String getMunicipio() {
        return municipio;
    }

    public void setMunicipio(String municipio) {
        this.municipio = municipio;
    }

    public String getIndicador() {
        return indicador;
    }

    public void setIndicador(String indicador) {
        this.indicador = indicador;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public String getFonte() {
        return fonte;
    }

    public void setFonte(String fonte) {
        this.fonte = fonte;
    }

    public LocalDate getDataReferencia() {
        return dataReferencia;
    }

    public void setDataReferencia(LocalDate dataReferencia) {
        this.dataReferencia = dataReferencia;
    }

    public String getUnidade() {
        return unidade;
    }

    public void setUnidade(String unidade) {
        this.unidade = unidade;
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
