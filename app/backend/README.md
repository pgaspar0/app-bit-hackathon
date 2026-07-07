# BiT App — Backend Spring Boot

Backend da equipa 48 (Hackathon BiT / B2G). Serve os dados tratados pelo
pipeline Python (`app/data/ingest.py`) ao frontend React, com os 5
endpoints definidos em `docs/DATA_CONTRACT.md`.

## Nota de geração — lê isto primeiro

Este código foi gerado pelo Claude a partir do schema, do contrato de
dados e da arquitectura já definidos pela equipa. Duas coisas importantes:

**1. Escolha de versão: Spring Boot 3.5.16, não 4.x.**
Em Novembro de 2025 e Junho de 2026 saíram o Spring Boot 4.0 e 4.1
(Spring Framework 7, Jakarta EE 11, Jackson 3). O 3.x chegou ao fim do
suporte open-source a 30 de Junho de 2026. Mesmo assim, escolhi
deliberadamente o **3.5.16** (o último patch da série 3.x, ainda
disponível no Maven Central) em vez do 4.x, porque:
- O Jackson 3 (usado pelo Spring Boot 4) muda o groupId dos pacotes e
  ainda não tenho informação fiável suficiente sobre os detalhes exactos
  para garantir código correcto à primeira.
- Para um MVP de hackathon, estabilidade e previsibilidade pesam mais do
  que estar na versão mais recente.
- Upgrade para 4.x mais tarde é uma migração conhecida e documentada pela
  Spring — vale a pena considerar se o projecto crescer para além do
  hackathon.

**2. Isto não foi compilado neste ambiente.** O sandbox onde este código
foi escrito não tem acesso ao Maven Central (só a um conjunto limitado de
domínios), por isso não consegui correr `mvn clean install` para
confirmar que compila. O que *foi* validado aqui:
- Sintaxe Java de todos os 47 ficheiros, com `javac` real (Java 21) —
  zero erros de sintaxe. Os únicos erros são `cannot find symbol` /
  `package does not exist`, esperados por faltarem as dependências do
  Spring no classpath deste sandbox.
- `pom.xml` é XML válido.
- Todas as chavetas/parênteses balanceados, todos os pacotes Java
  correspondem à estrutura de pastas.

Ou seja: a sintaxe está confirmada, mas a primeira vez que correres
`mvn clean install` num ambiente com internet real é a primeira
verificação completa (dependências a resolver, tipos do Hibernate a
validar contra o schema real). Se aparecer algum erro nessa altura, cola-o
numa conversa comigo que ajudo a resolver.

---

## Pré-requisitos

- Java 17+ (JDK, não só JRE)
- Maven 3.8+
- PostgreSQL a correr com o schema aplicado — a partir da raiz de `app/`:
  ```bash
  docker compose up -d
  ```

## Configuração

As variáveis de ambiente vêm do `.env` na raiz de `app/` (ver
`app/.env.example`). O Spring Boot lê-as com defaults sensatos para
desenvolvimento local — não precisas de configurar nada para correr com
os valores por omissão do `docker-compose.yml`.

| Variável              | Default local         | Descrição                          |
|------------------------|------------------------|-------------------------------------|
| `DB_HOST`              | `localhost`            | Host do PostgreSQL                  |
| `DB_PORT`              | `5432`                 | Porta do PostgreSQL                 |
| `DB_NAME`              | `bitapp`                | Nome da base de dados               |
| `DB_USER`              | `bit`                   | Utilizador da BD                    |
| `DB_PASSWORD`          | `bit`                   | Password da BD                      |
| `CORS_ALLOWED_ORIGINS` | `*`                     | Origens permitidas (frontend React) |
| `AI_SERVICE_URL`       | *(vazio)*              | URL do serviço de IA do Hércules — vazio usa sempre o fallback local |
| `INGEST_SCRIPT_PATH`   | `../data/ingest.py`     | Caminho do pipeline Python          |
| `SERVER_PORT`          | `8080`                  | Porta do backend                    |

## Correr localmente

```bash
cd app/backend
mvn spring-boot:run
```

A API fica disponível em `http://localhost:8080`.

## Testar

```bash
mvn test
```

O único teste (`BitBackendApplicationTests`) sobe o contexto Spring
completo e confirma que `ddl-auto=validate` passa contra o schema real —
por isso **precisa do PostgreSQL a correr** (`docker compose up -d`
primeiro). Não é um teste unitário isolado.

## Endpoints

| Método | Caminho                | O que faz                                    |
|--------|-------------------------|-----------------------------------------------|
| GET    | `/regioes`              | Lista as regiões carregadas                   |
| GET    | `/indicadores`          | Lista o catálogo de indicadores               |
| GET    | `/mapa`                 | Dados para o mapa interactivo                 |
| POST   | `/dados`                | Consulta principal (com filtros opcionais)    |
| POST   | `/ingestao/reprocessar` | Reexecuta o pipeline Python (baixa prioridade)|

Formatos completos de request/response em `docs/DATA_CONTRACT.md`.

### Exemplo rápido

```bash
curl http://localhost:8080/regioes

curl -X POST http://localhost:8080/dados \
  -H "Content-Type: application/json" \
  -d '{"consulta": "Onde falta cobertura de rede?", "idioma": "pt"}'
```

## Arquitectura do código

```
src/main/java/com/bitapp/backend/
├── entity/      9 entidades JPA — mapeiam 1:1 as tabelas de schema.sql
├── repository/  Spring Data JPA — queries nativas DISTINCT ON para "mais recente por região"
├── dto/         Contratos JSON exactos dos endpoints (Jackson SNAKE_CASE global)
├── service/     Lógica de negócio + o router IA/fallback
├── controller/  Camada fina — só delega para os services
├── config/      CORS + RestTemplate com timeouts curtos
└── exception/   Handler global — nunca deixa uma stack trace chegar ao cliente
```

### A decisão mais importante: IA com fallback automático

`POST /dados` nunca fica bloqueado à espera do serviço de IA do Hércules.
`QueryInterpreterRouter` tenta `AiServiceQueryInterpreter` só se
`AI_SERVICE_URL` estiver definida; qualquer falha (timeout, erro, resposta
vazia) cai automaticamente em `FallbackQueryInterpreter`, que gera uma
frase directamente a partir dos dados devolvidos pela query. Isto significa
que o backend é demonstrável de ponta a ponta mesmo antes da IA estar
pronta.

O contrato usado para chamar o serviço de IA
(`POST {AI_SERVICE_URL}/interpretar`) é uma **proposta**, não confirmada
com o Hércules — ver comentário em `AiInterpretarRequestDTO`. Quando o
contrato real for definido, só `AiServiceQueryInterpreter` precisa de
mudar.

## Troubleshooting

**Arranque falha com erro de schema validation (`ddl-auto=validate`)**
O Hibernate está a comparar as entidades Java contra as tabelas reais e
encontrou uma diferença. Antes de mexer no schema (não deves — é gerido
pelo Data Architect), tenta:
1. Confirma que `docker compose up -d` está a usar o `schema.sql` mais
   recente (`docker compose down -v` e sobe de novo se tiveres dúvidas).
2. Se um erro específico persistir (tipicamente `TEXT` vs `VARCHAR`),
   muda temporariamente `spring.jpa.hibernate.ddl-auto` para `none` no
   `application.properties` — isto ainda respeita 100% o schema
   existente, só deixa de o validar estritamente no arranque.

**`mvn clean install` falha a resolver dependências**
Confirma ligação à internet — precisa de acesso ao Maven Central
(`repo.maven.apache.org`). Se estiveres atrás de um proxy corporativo,
pode ser preciso configurar o `settings.xml` do Maven.

**CORS a bloquear chamadas do frontend**
Confirma que `CORS_ALLOWED_ORIGINS` inclui a origem real do frontend
(ex: `http://localhost:5173` para Vite). O default `*` já deveria
funcionar em desenvolvimento local.
