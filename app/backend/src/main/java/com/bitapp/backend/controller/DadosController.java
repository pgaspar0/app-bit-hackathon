package com.bitapp.backend.controller;

import com.bitapp.backend.dto.DadosRequestDTO;
import com.bitapp.backend.dto.DadosResponseDTO;
import com.bitapp.backend.service.DadosService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DadosController {

    private final DadosService dadosService;

    public DadosController(DadosService dadosService) {
        this.dadosService = dadosService;
    }

    /** POST /dados — o endpoint principal do produto. */
    @PostMapping("/dados")
    public DadosResponseDTO consultar(@Valid @RequestBody DadosRequestDTO request) {
        return dadosService.processarConsulta(request);
    }
}
