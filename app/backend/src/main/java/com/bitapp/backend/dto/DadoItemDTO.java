package com.bitapp.backend.dto;

import java.math.BigDecimal;

/**
 * Um item do array "dados" em POST /dados: { regiao, valor, fonte }.
 */
public class DadoItemDTO {

    private String regiao;
    private BigDecimal valor;
    private String fonte;

    public DadoItemDTO() {
    }

    public DadoItemDTO(String regiao, BigDecimal valor, String fonte) {
        this.regiao = regiao;
        this.valor = valor;
        this.fonte = fonte;
    }

    public String getRegiao() {
        return regiao;
    }

    public void setRegiao(String regiao) {
        this.regiao = regiao;
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
}
