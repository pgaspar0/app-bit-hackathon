package com.bitapp.backend.controller;

import com.bitapp.backend.dto.MapaResponseDTO;
import com.bitapp.backend.service.MapaService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MapaController {

    private final MapaService mapaService;

    public MapaController(MapaService mapaService) {
        this.mapaService = mapaService;
    }

    /** GET /mapa — dados para o mapa interactivo do frontend. */
    @GetMapping("/mapa")
    public MapaResponseDTO obterMapa(@RequestParam(required = false) String servico,
                                     @RequestParam(required = false) String indicador) {
        return mapaService.gerarMapa(servico, indicador);
    }
}
