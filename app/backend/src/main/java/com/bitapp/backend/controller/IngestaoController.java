package com.bitapp.backend.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * POST /ingestao/reprocessar — baixa prioridade (ver docs/PROMPT_BACKEND.md
 * secção 8.5). Tenta correr o pipeline Python (app/data/ingest.py) como
 * processo externo. Se o ambiente não permitir isso, devolve 501 com
 * instruções para correr manualmente — não é bloqueador para o MVP.
 */
@RestController
@RequestMapping("/ingestao")
public class IngestaoController {

    private static final Logger log = LoggerFactory.getLogger(IngestaoController.class);

    @Value("${ingest.script.path:../data/ingest.py}")
    private String scriptPath;

    @PostMapping("/reprocessar")
    public ResponseEntity<Map<String, String>> reprocessar() {
        try {
            ProcessBuilder pb = new ProcessBuilder("python3", scriptPath);
            pb.redirectErrorStream(true);
            Process process = pb.start();
            int exitCode = process.waitFor();

            if (exitCode == 0) {
                return ResponseEntity.ok(Map.of(
                        "status", "concluido",
                        "mensagem", "Ingestão reprocessada com sucesso."));
            }
            return ResponseEntity.status(500).body(Map.of(
                    "status", "erro",
                    "mensagem", "O script de ingestão terminou com código " + exitCode + "."));

        } catch (Exception e) {
            log.error("Falha ao reprocessar ingestão automaticamente", e);
            return ResponseEntity.status(501).body(Map.of(
                    "status", "nao_implementado",
                    "mensagem", "Não foi possível executar o pipeline automaticamente neste ambiente. "
                            + "Corre manualmente: python3 " + scriptPath));
        }
    }
}
