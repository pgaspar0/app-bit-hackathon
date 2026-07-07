package com.bitapp.backend.service;

import com.bitapp.backend.dto.DadoItemDTO;

import java.util.List;

/**
 * Abstrai como o campo "resposta_ia" de POST /dados é gerado. Existe para
 * que o backend nunca fique bloqueado à espera do serviço de IA do
 * Hércules — ver QueryInterpreterRouter para a lógica de selecção
 * automática entre IA real e fallback local.
 */
public interface QueryInterpreter {

    String gerarResposta(String consulta, List<DadoItemDTO> dados, String idioma);
}
