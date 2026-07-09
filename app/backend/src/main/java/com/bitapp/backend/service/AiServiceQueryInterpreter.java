package com.bitapp.backend.service;

import com.bitapp.backend.dto.AiInterpretarRequestDTO;
import com.bitapp.backend.dto.AiInterpretarResponseDTO;
import com.bitapp.backend.dto.DadoItemDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;

/**
 * Chama o serviço de IA (Hércules) via HTTP. O contrato usado aqui
 * (POST {AI_SERVICE_URL}/webhook) é uma PROPOSTA — ver
 * AiInterpretarRequestDTO para a nota completa. Ajusta esta classe
 * quando o contrato real for definido; nada mais no backend depende disto.
 *
 * Esta classe nunca é chamada directamente por DadosService — passa
 * sempre por QueryInterpreterRouter, que decide se a usa ou cai no
 * FallbackQueryInterpreter.
 */
@Component
public class AiServiceQueryInterpreter implements QueryInterpreter {

    private final RestTemplate restTemplate;

    @Value("${ai.service.url:}")
    private String aiServiceUrl;

    public AiServiceQueryInterpreter(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public String gerarResposta(String consulta, List<DadoItemDTO> dados, String idioma) {
        AiInterpretarRequestDTO request = new AiInterpretarRequestDTO(consulta, dados, idioma);

        AiInterpretarResponseDTO response = restTemplate.postForObject(
                aiServiceUrl + "/webhook", request, AiInterpretarResponseDTO.class);

        if (response == null || response.getRespostaIa() == null || response.getRespostaIa().isBlank()) {
            throw new IllegalStateException("Serviço de IA devolveu uma resposta vazia.");
        }
        return response.getRespostaIa();
    }

    /**
     * Se AI_SERVICE_URL não estiver definida, o router nem tenta chamar
     * este interpretador — vai directo para o fallback.
     */
    public boolean isConfigurado() {
        return aiServiceUrl != null && !aiServiceUrl.isBlank();
    }
}
