-- ============================================================
-- SCHEMA BiT APP — Hackathon Equipa 48
-- Data Architect: Paulo
-- Versão: 1.0
-- Fonte principal: Vísent CDRView (RM de Florianópolis)
-- ============================================================
-- Ordem de criação (respeita dependências de FOREIGN KEY):
--   1. sources
--   2. regions
--   3. indicators
--   4. coverage_points
--   5. observations
--   6. subscriber_demographics
--   7. od_flows
--   8. programs
--   9. query_logs
-- ============================================================


-- ------------------------------------------------------------
-- 1. SOURCES — fontes de dados registadas no sistema
-- ------------------------------------------------------------
CREATE TABLE sources (
    id                SERIAL PRIMARY KEY,
    source_name       TEXT NOT NULL UNIQUE,
    source_type       TEXT NOT NULL CHECK (source_type IN ('dataset', 'public', 'manual')),
    url               TEXT,
    reliability_score NUMERIC(3,2),
    created_at        TIMESTAMP DEFAULT NOW()
);

-- Dados de arranque — inseridos pelo pipeline de ingestão
-- ('Vísent CDRView', 'Anatel')


-- ------------------------------------------------------------
-- 2. REGIONS — regiões geográficas (clusters de mobilidade)
--
-- Unidade geográfica base de todo o sistema.
-- Os 27 clusters cobrem a RM de Florianópolis.
-- 4 clusters existem em assinantes.csv mas sem antenas atribuídas
-- em antenas_flp.csv — lat/lng ficam NULL até haver mais dados.
-- ------------------------------------------------------------
CREATE TABLE regions (
    id           SERIAL PRIMARY KEY,
    cluster_code TEXT NOT NULL UNIQUE,  -- ex: 'CBD_BEIRAMAR', 'UFSC'
    municipio    TEXT NOT NULL,         -- normalizado sem acentos
    country      TEXT NOT NULL DEFAULT 'Brasil',
    lat          NUMERIC(10,6),         -- centróide do cluster
    lng          NUMERIC(10,6),         -- centróide do cluster
    metadata     JSONB                  -- dados extras sem schema fixo
);

CREATE INDEX idx_regions_cluster_code ON regions(cluster_code);
CREATE INDEX idx_regions_municipio ON regions(municipio);


-- ------------------------------------------------------------
-- 3. INDICATORS — catálogo de métricas disponíveis
--
-- Pré-populado pelo pipeline com os indicadores do Vísent.
-- Novas fontes (DATASUS, OMS) adicionam novos indicadores
-- sem alterar o schema.
-- ------------------------------------------------------------
CREATE TABLE indicators (
    id             SERIAL PRIMARY KEY,
    indicator_name TEXT NOT NULL UNIQUE,
    category       TEXT NOT NULL CHECK (category IN (
                       'conectividade',
                       'emprego',
                       'formacao',
                       'mentoria',
                       'saude_mental',
                       'estrutura_social',
                       'mobilidade'
                   )),
    unit           TEXT,
    description    TEXT,
    source_type    TEXT
);

-- Indicadores pré-populados pelo pipeline:
--   n_usuarios          | mobilidade    | pessoas
--   congestionamento    | conectividade | score 0-1
--   download_bytes_gb   | conectividade | GB
--   antenas_por_cluster | conectividade | unidades


-- ------------------------------------------------------------
-- 4. COVERAGE_POINTS — antenas ERB (pontos físicos de rede)
--
-- 132 antenas reais da Claro / Anatel.
-- Alimentada por: antenas_flp.csv
-- technology: vazio no MVP — preparado para fontes futuras.
-- ------------------------------------------------------------
CREATE TABLE coverage_points (
    id             SERIAL PRIMARY KEY,
    ecgi           TEXT NOT NULL UNIQUE,  -- SEMPRE string, nunca numérico
    region_id      INTEGER NOT NULL REFERENCES regions(id),
    lat            NUMERIC(10,6) NOT NULL,
    lng            NUMERIC(10,6) NOT NULL,
    technology     TEXT,                  -- 5G/4G/3G — NULL no MVP
    signal_quality NUMERIC(5,2),          -- NULL no MVP
    source_id      INTEGER REFERENCES sources(id)
);

CREATE INDEX idx_coverage_points_region ON coverage_points(region_id);
CREATE INDEX idx_coverage_points_ecgi ON coverage_points(ecgi);


-- ------------------------------------------------------------
-- 5. OBSERVATIONS — observações por região, indicador e data
--
-- Tabela central do sistema de indicadores.
-- Alimentada por: tensor_concentracao.csv (e futuras fontes)
--
-- Colunas do tensor_concentracao.csv mapeadas aqui:
--   ecgi + cluster  → region_id  (pipeline agrega de antena para cluster)
--   day_date        → obs_date
--   periodo         → period
--   n_usuarios      → obs_value  (indicator: n_usuarios)
--   congestionamento_medio → obs_value  (indicator: congestionamento)
--   download_bytes  → obs_value  (indicator: download_bytes_gb)
--
-- Nota: cada indicador gera uma linha separada por (region, date, period).
--
-- UNIQUE previne duplicados ao reprocessar a ingestão.
-- period usa 'ALL' como valor padrão para agregados sem período definido
-- (NULL quebraria o UNIQUE — NULL != NULL em SQL).
-- ------------------------------------------------------------
CREATE TABLE observations (
    id           SERIAL PRIMARY KEY,
    region_id    INTEGER NOT NULL REFERENCES regions(id),
    indicator_id INTEGER NOT NULL REFERENCES indicators(id),
    source_id    INTEGER NOT NULL REFERENCES sources(id),
    obs_date     DATE NOT NULL,
    period       TEXT NOT NULL DEFAULT 'ALL'
                     CHECK (period IN ('MADRUGADA', 'MANHA', 'TARDE', 'NOITE', 'ALL')),
    obs_value    NUMERIC(15,4) NOT NULL,
    unit         TEXT,
    metadata     JSONB,

    UNIQUE (region_id, indicator_id, obs_date, period)
);

CREATE INDEX idx_observations_region ON observations(region_id);
CREATE INDEX idx_observations_indicator ON observations(indicator_id);
CREATE INDEX idx_observations_date ON observations(obs_date);


-- ------------------------------------------------------------
-- 6. SUBSCRIBER_DEMOGRAPHICS — perfil demográfico por cluster
--
-- AGREGADO — não armazena assinantes individuais.
-- 200K linhas de assinantes.csv → ~1.600 combinações.
-- Alimentada por: assinantes.csv
--
-- Colunas de assinantes.csv usadas:
--   home_cluster    → region_id
--   income_cluster  → income_cluster
--   age_group       → age_group
--   mobility_pattern→ mobility_pattern
--   flag_flagship   → somado em flagship_count
-- ------------------------------------------------------------
CREATE TABLE subscriber_demographics (
    id               SERIAL PRIMARY KEY,
    region_id        INTEGER NOT NULL REFERENCES regions(id),
    income_cluster   TEXT NOT NULL CHECK (income_cluster IN ('A', 'B', 'C', 'D')),
    age_group        TEXT NOT NULL CHECK (age_group IN (
                         '18-24', '25-34', '35-44', '45-54', '55+'
                     )),
    mobility_pattern TEXT NOT NULL CHECK (mobility_pattern IN (
                         'BAIXA', 'MODERADA', 'INTENSA'
                     )),
    subscriber_count INTEGER NOT NULL DEFAULT 0,
    flagship_count   INTEGER NOT NULL DEFAULT 0,
    source_id        INTEGER REFERENCES sources(id),

    UNIQUE (region_id, income_cluster, age_group, mobility_pattern)
);

CREATE INDEX idx_demographics_region ON subscriber_demographics(region_id);
CREATE INDEX idx_demographics_income ON subscriber_demographics(income_cluster);


-- ------------------------------------------------------------
-- 7. OD_FLOWS — fluxos origem-destino entre clusters
--
-- Pares de deslocamento k-anonimizados (K=3).
-- Alimentada por: trajetos_comuns.csv (506 pares)
--
-- lat/lng de origem e destino NÃO são guardados aqui —
-- obtêm-se por JOIN com regions.
-- ------------------------------------------------------------
CREATE TABLE od_flows (
    id                   SERIAL PRIMARY KEY,
    region_origem_id     INTEGER NOT NULL REFERENCES regions(id),
    region_destino_id    INTEGER NOT NULL REFERENCES regions(id),
    mesmo_cluster        BOOLEAN NOT NULL DEFAULT FALSE,
    n_usuarios           INTEGER NOT NULL,
    n_viagens            INTEGER NOT NULL,
    dist_media_km        NUMERIC(8,3),
    periodo_predominante TEXT,
    source_id            INTEGER REFERENCES sources(id),

    UNIQUE (region_origem_id, region_destino_id)
);

CREATE INDEX idx_od_flows_origem ON od_flows(region_origem_id);
CREATE INDEX idx_od_flows_destino ON od_flows(region_destino_id);


-- ------------------------------------------------------------
-- 8. PROGRAMS — programas públicos por região
--
-- Vazio no MVP.
-- Preparado para dados externos futuros:
-- DATASUS, programas de formação, mentoria, iniciativas sociais.
-- ------------------------------------------------------------
CREATE TABLE programs (
    id           SERIAL PRIMARY KEY,
    program_name TEXT NOT NULL,
    category     TEXT NOT NULL,
    region_id    INTEGER REFERENCES regions(id),
    description  TEXT,
    status       TEXT DEFAULT 'active',
    source_id    INTEGER REFERENCES sources(id)
);

CREATE INDEX idx_programs_region ON programs(region_id);
CREATE INDEX idx_programs_category ON programs(category);


-- ------------------------------------------------------------
-- 9. QUERY_LOGS — registo das consultas feitas à IA
--
-- Alimentada pelo serviço de IA do Hércules.
-- Útil para auditar respostas e melhorar prompts.
-- ------------------------------------------------------------
CREATE TABLE query_logs (
    id               SERIAL PRIMARY KEY,
    user_query       TEXT NOT NULL,
    normalized_query TEXT,
    filters          JSONB,
    result_summary   TEXT,
    created_at       TIMESTAMP DEFAULT NOW()
);
