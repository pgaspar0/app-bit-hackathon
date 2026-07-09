package com.bitapp.backend.dto;

/**
 * Filtros opcionais dentro de POST /dados. Ambos os campos são opcionais —
 * quando ausentes, a consulta corre sem esse filtro.
 */
public class FiltrosDTO {

    private String regiao;
    private String indicador;
    private String servico;

    public FiltrosDTO() {
    }

    public FiltrosDTO(String regiao, String indicador) {
        this.regiao = regiao;
        this.indicador = indicador;
    }

    public FiltrosDTO(String regiao, String indicador, String servico) {
        this.regiao = regiao;
        this.indicador = indicador;
        this.servico = servico;
    }

    public String getRegiao() {
        return regiao;
    }

    public void setRegiao(String regiao) {
        this.regiao = regiao;
    }

    public String getIndicador() {
        return indicador;
    }

    public void setIndicador(String indicador) {
        this.indicador = indicador;
    }

    public String getServico() {
        return servico;
    }

    public void setServico(String servico) {
        this.servico = servico;
    }
}
