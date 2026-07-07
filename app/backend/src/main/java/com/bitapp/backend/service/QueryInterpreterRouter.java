package com.bitapp.backend.service;

import com.bitapp.backend.dto.DadoItemDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Ponto único usado por DadosService para obter "resposta_ia". Decide
 * automaticamente entre o serviço de IA real e o fallback local:
 *
 *  - AI_SERVICE_URL não configurada  -> usa sempre o fallback.
 *  - AI_SERVICE_URL configurada e OK -> usa a resposta da IA.
 *  - AI_SERVICE_URL configurada mas falha (timeout, erro, resposta vazia)
 *    -> regista um aviso e cai no fallback. Nunca deixa o endpoint falhar
 *       só por causa da IA.
 */
@Service
public class QueryInterpreterRouter {

    private static final Logger log = LoggerFactory.getLogger(QueryInterpreterRouter.class);

    private final AiServiceQueryInterpreter aiServiceQueryInterpreter;
    private final FallbackQueryInterpreter fallbackQueryInterpreter;

    public QueryInterpreterRouter(AiServiceQueryInterpreter aiServiceQueryInterpreter,
                                   FallbackQueryInterpreter fallbackQueryInterpreter) {
        this.aiServiceQueryInterpreter = aiServiceQueryInterpreter;
        this.fallbackQueryInterpreter = fallbackQueryInterpreter;
    }

    public String gerarResposta(String consulta, List<DadoItemDTO> dados, String idioma) {
        if (aiServiceQueryInterpreter.isConfigurado()) {
            try {
                return aiServiceQueryInterpreter.gerarResposta(consulta, dados, idioma);
            } catch (Exception e) {
                log.warn("Serviço de IA indisponível ou com erro ({}). A usar resposta de fallback.",
                        e.getMessage());
            }
        }
        return fallbackQueryInterpreter.gerarResposta(consulta, dados, idioma);
    }
}
