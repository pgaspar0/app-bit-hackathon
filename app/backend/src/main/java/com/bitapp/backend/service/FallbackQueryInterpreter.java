package com.bitapp.backend.service;

import com.bitapp.backend.dto.DadoItemDTO;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Gera uma frase simples directamente a partir dos dados devolvidos pela
 * query, sem chamar nada externo. É o que garante que POST /dados nunca
 * falha só porque o serviço de IA ainda não está pronto ou está em baixo.
 */
@Component
public class FallbackQueryInterpreter implements QueryInterpreter {

    @Override
    public String gerarResposta(String consulta, List<DadoItemDTO> dados, String idioma) {
        if (dados == null || dados.isEmpty()) {
            return "Não foram encontrados dados para os filtros indicados nesta consulta.";
        }

        DadoItemDTO destaque = dados.get(0);

        String valorFormatado = destaque.getValor().stripTrailingZeros().toPlainString();
        String local = destaque.getMunicipio() == null || destaque.getMunicipio().isBlank()
            ? destaque.getRegiao()
            : destaque.getRegiao() + " (" + destaque.getMunicipio() + ")";

        return String.format(
            "A região %s aparece como prioridade nesta consulta (%s), com base em dados de %s. "
                + "É uma referência inicial para avaliação territorial e decisão pública.",
            local, valorFormatado, destaque.getFonte());
    }
}
