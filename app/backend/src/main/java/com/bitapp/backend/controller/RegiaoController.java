package com.bitapp.backend.controller;

import com.bitapp.backend.dto.RegiaoDTO;
import com.bitapp.backend.service.RegiaoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class RegiaoController {

    private final RegiaoService regiaoService;

    public RegiaoController(RegiaoService regiaoService) {
        this.regiaoService = regiaoService;
    }

    /** GET /regioes — lista as regiões carregadas no sistema. */
    @GetMapping("/regioes")
    public List<RegiaoDTO> listar() {
        return regiaoService.listarTodas();
    }
}
