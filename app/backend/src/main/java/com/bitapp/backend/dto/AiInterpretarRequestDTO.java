package com.bitapp.backend.dto;

import java.util.List;

/**
 * Corpo enviado ao serviço de IA (Hércules) em POST {AI_SERVICE_URL}/interpretar.
 *
 * Este é um CONTRATO PROPOSTO, não confirmado com o serviço de IA — quando
 * o formato real for definido, ajusta apenas esta classe e
 * AiInterpretarResponseDTO. Nada mais no backend depende destes formatos.
 */
public class AiInterpretarRequestDTO {

    private String consulta;
    private List<DadoItemDTO> dados;
    private String idioma;

    public AiInterpretarRequestDTO() {
    }

    public AiInterpretarRequestDTO(String consulta, List<DadoItemDTO> dados, String idioma) {
        this.consulta = consulta;
        this.dados = dados;
        this.idioma = idioma;
    }

    public String getConsulta() {
        return consulta;
    }

    public void setConsulta(String consulta) {
        this.consulta = consulta;
    }

    public List<DadoItemDTO> getDados() {
        return dados;
    }

    public void setDados(List<DadoItemDTO> dados) {
        this.dados = dados;
    }

    public String getIdioma() {
        return idioma;
    }

    public void setIdioma(String idioma) {
        this.idioma = idioma;
    }
}
