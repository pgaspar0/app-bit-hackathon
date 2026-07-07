package com.bitapp.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

/**
 * Corpo do request de POST /dados.
 * {
 *   "consulta": "...",
 *   "filtros": { "regiao": "...", "indicador": "..." },
 *   "idioma": "pt"
 * }
 */
public class DadosRequestDTO {

    @NotBlank(message = "O campo 'consulta' é obrigatório e não pode estar vazio.")
    private String consulta;

    @Valid
    private FiltrosDTO filtros;

    private String idioma;

    public DadosRequestDTO() {
    }

    public String getConsulta() {
        return consulta;
    }

    public void setConsulta(String consulta) {
        this.consulta = consulta;
    }

    public FiltrosDTO getFiltros() {
        return filtros;
    }

    public void setFiltros(FiltrosDTO filtros) {
        this.filtros = filtros;
    }

    public String getIdioma() {
        return idioma;
    }

    public void setIdioma(String idioma) {
        this.idioma = idioma;
    }
}
