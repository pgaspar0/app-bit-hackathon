package com.bitapp.backend.dto;

import java.util.List;

/**
 * Corpo completo da resposta de POST /dados.
 * respostaIa -> resposta_ia via Jackson SNAKE_CASE global.
 */
public class DadosResponseDTO {

    private String respostaIa;
    private String resumoExecutivo;
    private String prioridadeIntervencao;
    private String recomendacao;
    private DadosEstatisticasDTO estatisticas;
    private List<DadoItemDTO> topRegioes;
    private List<DadoItemDTO> dados;
    private List<String> fontes;

    public DadosResponseDTO() {
    }

    public DadosResponseDTO(String respostaIa, String resumoExecutivo,
                            String prioridadeIntervencao, String recomendacao,
                            DadosEstatisticasDTO estatisticas,
                            List<DadoItemDTO> topRegioes,
                            List<DadoItemDTO> dados, List<String> fontes) {
        this.respostaIa = respostaIa;
        this.resumoExecutivo = resumoExecutivo;
        this.prioridadeIntervencao = prioridadeIntervencao;
        this.recomendacao = recomendacao;
        this.estatisticas = estatisticas;
        this.topRegioes = topRegioes;
        this.dados = dados;
        this.fontes = fontes;
    }

    public String getRespostaIa() {
        return respostaIa;
    }

    public void setRespostaIa(String respostaIa) {
        this.respostaIa = respostaIa;
    }

    public String getResumoExecutivo() {
        return resumoExecutivo;
    }

    public void setResumoExecutivo(String resumoExecutivo) {
        this.resumoExecutivo = resumoExecutivo;
    }

    public String getPrioridadeIntervencao() {
        return prioridadeIntervencao;
    }

    public void setPrioridadeIntervencao(String prioridadeIntervencao) {
        this.prioridadeIntervencao = prioridadeIntervencao;
    }

    public String getRecomendacao() {
        return recomendacao;
    }

    public void setRecomendacao(String recomendacao) {
        this.recomendacao = recomendacao;
    }

    public DadosEstatisticasDTO getEstatisticas() {
        return estatisticas;
    }

    public void setEstatisticas(DadosEstatisticasDTO estatisticas) {
        this.estatisticas = estatisticas;
    }

    public List<DadoItemDTO> getTopRegioes() {
        return topRegioes;
    }

    public void setTopRegioes(List<DadoItemDTO> topRegioes) {
        this.topRegioes = topRegioes;
    }

    public List<DadoItemDTO> getDados() {
        return dados;
    }

    public void setDados(List<DadoItemDTO> dados) {
        this.dados = dados;
    }

    public List<String> getFontes() {
        return fontes;
    }

    public void setFontes(List<String> fontes) {
        this.fontes = fontes;
    }
}
