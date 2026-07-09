package com.bitapp.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Resposta esperada do serviço de IA. Ver nota de contrato proposto em
 * AiInterpretarRequestDTO.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class AiInterpretarResponseDTO {

    private String respostaIa;

    public AiInterpretarResponseDTO() {
    }

    public String getRespostaIa() {
        return respostaIa;
    }

    public void setRespostaIa(String respostaIa) {
        this.respostaIa = respostaIa;
    }
}
