package com.bitapp.backend.dto;

import java.math.BigDecimal;

/**
 * Estatísticas de apoio para a resposta de POST /dados.
 * Mantém o frontend data-driven e pronto para qualquer geografia ou fonte.
 */
public class DadosEstatisticasDTO {

    private Integer totalRegistros;
    private Integer totalRegioes;
    private BigDecimal valorMedio;
    private BigDecimal valorMinimo;
    private BigDecimal valorMaximo;
    private String regiaoDestaque;

    public DadosEstatisticasDTO() {
    }

    public DadosEstatisticasDTO(Integer totalRegistros, Integer totalRegioes,
                                BigDecimal valorMedio, BigDecimal valorMinimo,
                                BigDecimal valorMaximo, String regiaoDestaque) {
        this.totalRegistros = totalRegistros;
        this.totalRegioes = totalRegioes;
        this.valorMedio = valorMedio;
        this.valorMinimo = valorMinimo;
        this.valorMaximo = valorMaximo;
        this.regiaoDestaque = regiaoDestaque;
    }

    public Integer getTotalRegistros() {
        return totalRegistros;
    }

    public void setTotalRegistros(Integer totalRegistros) {
        this.totalRegistros = totalRegistros;
    }

    public Integer getTotalRegioes() {
        return totalRegioes;
    }

    public void setTotalRegioes(Integer totalRegioes) {
        this.totalRegioes = totalRegioes;
    }

    public BigDecimal getValorMedio() {
        return valorMedio;
    }

    public void setValorMedio(BigDecimal valorMedio) {
        this.valorMedio = valorMedio;
    }

    public BigDecimal getValorMinimo() {
        return valorMinimo;
    }

    public void setValorMinimo(BigDecimal valorMinimo) {
        this.valorMinimo = valorMinimo;
    }

    public BigDecimal getValorMaximo() {
        return valorMaximo;
    }

    public void setValorMaximo(BigDecimal valorMaximo) {
        this.valorMaximo = valorMaximo;
    }

    public String getRegiaoDestaque() {
        return regiaoDestaque;
    }

    public void setRegiaoDestaque(String regiaoDestaque) {
        this.regiaoDestaque = regiaoDestaque;
    }
}