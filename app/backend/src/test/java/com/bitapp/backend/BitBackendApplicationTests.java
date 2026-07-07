package com.bitapp.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Teste de fumo: confirma que o contexto Spring arranca e que
 * ddl-auto=validate passa contra o schema real.
 *
 * IMPORTANTE: este teste precisa do PostgreSQL a correr com o schema já
 * aplicado (docker compose up -d na raiz de app/) — não é um teste
 * unitário isolado, é um teste de integração mínimo.
 */
@SpringBootTest
class BitBackendApplicationTests {

    @Test
    void contextLoads() {
        // Se o contexto arrancar sem excepções, a ligação à BD e a
        // validação do schema (ddl-auto=validate) foram bem-sucedidas.
    }
}
