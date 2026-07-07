package com.bitapp.backend.controller;

import com.bitapp.backend.dto.IndicadorDTO;
import com.bitapp.backend.service.IndicadorService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class IndicadorController {

    private final IndicadorService indicadorService;

    public IndicadorController(IndicadorService indicadorService) {
        this.indicadorService = indicadorService;
    }

    /** GET /indicadores — lista o catálogo de indicadores disponíveis. */
    @GetMapping("/indicadores")
    public List<IndicadorDTO> listar() {
        return indicadorService.listarTodos();
    }
}
