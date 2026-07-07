package com.bitapp.backend.dto;

import java.util.List;

/**
 * Corpo completo da resposta de POST /dados.
 * respostaIa -> resposta_ia via Jackson SNAKE_CASE global.
 */
public class DadosResponseDTO {

    private String respostaIa;
    private List<DadoItemDTO> dados;
    private List<String> fontes;

    public DadosResponseDTO() {
    }

    public DadosResponseDTO(String respostaIa, List<DadoItemDTO> dados, List<String> fontes) {
        this.respostaIa = respostaIa;
        this.dados = dados;
        this.fontes = fontes;
    }

    public String getRespostaIa() {
        return respostaIa;
    }

    public void setRespostaIa(String respostaIa) {
        this.respostaIa = respostaIa;
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
