package com.bitapp.backend.dto;

import java.time.LocalDateTime;

/**
 * Corpo de resposta padrão para qualquer erro devolvido pela API
 * (ver GlobalExceptionHandler). Nunca inclui stack traces.
 */
public class ErrorResponseDTO {

    private int status;
    private String mensagem;
    private LocalDateTime timestamp;

    public ErrorResponseDTO() {
    }

    public ErrorResponseDTO(int status, String mensagem) {
        this.status = status;
        this.mensagem = mensagem;
        this.timestamp = LocalDateTime.now();
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public String getMensagem() {
        return mensagem;
    }

    public void setMensagem(String mensagem) {
        this.mensagem = mensagem;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
