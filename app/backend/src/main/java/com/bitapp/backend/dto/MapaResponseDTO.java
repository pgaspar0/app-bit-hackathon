package com.bitapp.backend.dto;

import java.util.List;

/**
 * Corpo completo da resposta de GET /mapa: { "regioes": [ ... ] }
 */
public class MapaResponseDTO {

    private List<RegiaoMapaDTO> regioes;

    public MapaResponseDTO() {
    }

    public MapaResponseDTO(List<RegiaoMapaDTO> regioes) {
        this.regioes = regioes;
    }

    public List<RegiaoMapaDTO> getRegioes() {
        return regioes;
    }

    public void setRegioes(List<RegiaoMapaDTO> regioes) {
        this.regioes = regioes;
    }
}
