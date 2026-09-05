# BiT App — Equipa 48

Aplicação de apoio à decisão pública construída durante o hackathon BiT, com foco em identificar prioridades territoriais para políticas públicas a partir de dados de mobilidade, conectividade e cobertura. A solução combina um backend em Spring Boot, frontend em React + Vite e um pipeline de dados em Python para ingesta, normalização e disponibilização de indicadores.

## Visão geral

O produto permite:

- consultar regiões e indicadores territoriais;
- comparar áreas por métricas de conectividade e mobilidade;
- visualizar a distribuição no mapa interativo;
- obter resposta estruturada com evidências e recomendação de prioridade;
- explorar diferentes serviços temáticos, como formação, empregabilidade, experiências, mentorias e saúde mental.

A proposta é um MVP orientado para demonstração e decisão pública, com foco em rapidez de execução, clareza de dados e fácil integração entre camadas.

## Arquitectura da solução

```text
Dataset e fontes territoriais
        │
        ▼
Pipeline Python / SQL
        │
        ▼
PostgreSQL
        │
        ▼
Spring Boot API
        │
        ▼
React + Vite frontend
```

### Componentes principais

- Frontend: interface de consulta, painel de evidências e mapa interativo
- Backend: API REST para consultas, filtros e lógica de priorização
- Dados: ingestão e modelagem do dataset, schema SQL e normalização
- Documentação: contratos de API, arquitetura e contexto técnico do projecto

## Stack tecnológica

### Frontend

- React 19
- Vite
- Tailwind CSS
- Leaflet

### Backend

- Java 17
- Spring Boot 3.5.16
- Spring Web
- Spring Data JPA
- PostgreSQL Driver
- Bean Validation

### Dados e ingestão

- Python 3.14+ (de acordo com o projeto data)
- Pandas
- psycopg2
- python-dotenv
- FastAPI / Flask / UVicorn (presente no módulo de dados)

## Estrutura do repositório

```text
app-bit-hackathon/
├── README.md
├── app/
│   ├── .env.example
│   ├── docker-compose.yml
│   ├── backend/
│   │   ├── pom.xml
│   │   ├── README.md
│   │   └── src/
│   │       ├── main/java/com/bitapp/backend/
│   │       └── test/java/com/bitapp/backend/
│   ├── data/
│   │   ├── ingest.py
│   │   ├── main.py
│   │   ├── schema.sql
│   │   ├── pyproject.toml
│   │   ├── requirements.txt
│   │   ├── tools.py
│   │   ├── webhook.py
│   │   └── README.md
│   └── frontend/
│       ├── package.json
│       ├── vite.config.js
│       ├── index.html
│       └── src/
├── dataset-visent/
├── docs/
│   ├── architecture.md
│   ├── DATA_CONTRACT.md
│   └── ...
└── .github/
```

## Fluxo principal do produto

1. O utilizador escolhe um serviço temático no frontend.
2. A interface envia uma consulta para a API REST do backend.
3. O backend pesquisa regiões e indicadores relevantes.
4. Os dados são agregados e priorizados por contexto territorial.
5. O frontend apresenta mapa, estatísticas e recomendação para intervenção.
6. O pipeline de dados assegura a ingestão e atualização dos indicadores na base de dados.

## Requisitos

Antes de correr a aplicação, confirma que tens instalado:

- Java 17+
- Maven 3.8+
- Node.js 18+
- npm
- Docker + Docker Compose
- Python 3.14+ (para o módulo de dados)

## Configuração inicial

### 1) Criar ficheiro de variáveis de ambiente

Dentro de [app/.env.example](app/.env.example), existem os valores base para a aplicação. Copia para um ficheiro `.env` na mesma pasta:

```bash
cd app
cp .env.example .env
```

Os valores principais incluem:

- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `DATA_DIR`, `REFERENCIAS_DIR`, `TENSORES_DIR`
- `APP_ENV`
- `AI_SERVICE_URL`

## Executar a base de dados

O projeto usa PostgreSQL para armazenar regiões, indicadores e observações. O serviço pode ser levantado com Docker:

```bash
cd app
docker compose up -d
```

O ficheiro [app/docker-compose.yml](app/docker-compose.yml) monta o esquema SQL automaticamente. O schema principal encontra-se em [app/data/schema.sql](app/data/schema.sql).

## Executar o backend

```bash
cd app/backend
mvn spring-boot:run
```

A API estará disponível em:

- http://localhost:8080

Principais endpoints:

- `GET /regioes`
- `GET /indicadores`
- `GET /mapa`
- `POST /dados`
- `POST /ingestao/reprocessar`

## Executar o frontend

```bash
cd app/frontend
npm install
npm run dev
```

O frontend fica normalmente disponível em:

- http://localhost:5173

## Executar o pipeline de dados

O módulo de dados usa Python para carregar, normalizar e inserir os dados territoriais na base de dados PostgreSQL.

```bash
cd app/data
uv sync
uv run python ingest.py
```

Se quiseres validar sem re-ingestar tudo, podes consultar o README do módulo em [app/data/README.md](app/data/README.md).

## Documentação técnica

- [docs/arquitecture.md](docs/arquitecture.md): visão da arquitetura do produto
- [docs/DATA_CONTRACT.md](docs/DATA_CONTRACT.md): contrato formal da API e dados
- [app/backend/README.md](app/backend/README.md): detalhes do backend Spring Boot
- [app/data/README.md](app/data/README.md): instruções do pipeline de ingestão

## Exemplo de uso

### Consulta principal

```bash
curl -X POST http://localhost:8080/dados \
  -H "Content-Type: application/json" \
  -d '{
    "consulta": "Onde há maior necessidade de reforço de formação?",
    "filtros": {
      "servico": "formacoes"
    },
    "idioma": "pt"
  }'
```

### Mapa territorial

```bash
curl "http://localhost:8080/mapa?servico=formacoes"
```

## Funcionalidades do MVP

- consulta natural em linguagem portuguesa;
- filtro por região, indicador e serviço;
- leitura geográfica no mapa;
- evidência e ranking de territórios;
- resposta estruturada com estatísticas e recomendação;
- fallback resiliente quando não existe serviço externo de IA.

## Autor / Equipa

- Equipa 48
- Hackathon BiT