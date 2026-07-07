package com.bitapp.backend.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Configuration
public class RestClientConfig {

    /**
     * Timeouts curtos de propósito: se o serviço de IA estiver lento ou em
     * baixo, queremos falhar depressa e cair no FallbackQueryInterpreter
     * em vez de deixar o utilizador à espera.
     */
    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .connectTimeout(Duration.ofSeconds(3))
                .readTimeout(Duration.ofSeconds(5))
                .build();
    }
}
