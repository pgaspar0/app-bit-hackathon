# Data Contract — BiT App / Equipa 48

**Versão:** 1.0  
**Data Architect:** Paulo  
**Destinatários:** Victor (Backend), Hércules (IA)  
**Última actualização:** Junho 2026

---

## 1. O que este documento é

Define o que existe na base de dados, como consultá-la, e o que cada
endpoint pode esperar receber. É a fonte de verdade entre o trabalho
de dados e o trabalho de backend e IA.

Se algo mudar na BD — nova tabela, novo indicador, nova fonte —
este documento é actualizado antes de qualquer outra coisa.

---

## 2. Visão geral da base de dados

A BD contém dados da **Região Metropolitana de Florianópolis, Brasil**,
provenientes do dataset Vísent CDRView (dados sintéticos com coordenadas
reais de antenas Anatel).

### Tabelas e o que contêm

| Tabela                   | O que contém                                      | Linhas aprox. |
|--------------------------|---------------------------------------------------|---------------|
| `sources`                | Fontes de dados registadas                        | 2             |
| `regions`                | 27 clusters geográficos da RM Florianópolis       | 27            |
| `indicators`             | Catálogo de métricas disponíveis                  | 4             |
| `coverage_points`        | 132 antenas ERB reais (Claro / Anatel)            | 132           |
| `observations`           | Indicadores por cluster, data e período           | variável      |
| `subscriber_demographics`| Perfil demográfico agregado por cluster           | ~1.600        |
| `od_flows`               | Fluxos origem-destino k-anonimizados (K=3)        | 506           |
| `programs`               | Programas públicos — **vazio no MVP**             | 0             |
| `query_logs`             | Registo de consultas à IA                         | variável      |

---

## 3. Tabelas em detalhe

### 3.1 `regions`

Unidade geográfica base. Tudo se liga a esta tabela.

| Coluna         | Tipo          | Notas                                          |
|----------------|---------------|------------------------------------------------|
| `id`           | INTEGER       | Chave primária                                 |
| `cluster_code` | TEXT          | Identificador único. Ex: `CBD_BEIRAMAR`, `UFSC`|
| `municipio`    | TEXT          | Normalizado, sem acentos. Ex: `FLORIANOPOLIS`  |
| `country`      | TEXT          | `Brasil` no MVP                                |
| `lat`          | NUMERIC(10,6) | Centróide do cluster. **NULL se sem cobertura**|
| `lng`          | NUMERIC(10,6) | Centróide do cluster. **NULL se sem cobertura**|
| `metadata`     | JSONB         | Dados extras — vazio no MVP                    |

**Atenção:** 4 clusters têm `lat` e `lng` **NULL** — são regiões sem
cobertura de rede. Esta ausência é um dado de produto, não um erro.
Representa exactamente onde falta infraestrutura antes de chegarem
programas sociais.

---

### 3.2 `indicators`

Catálogo fixo de métricas disponíveis.

| `indicator_name`      | `category`      | `unit`      | Descrição                                     |
|-----------------------|-----------------|-------------|-----------------------------------------------|
| `n_usuarios`          | `mobilidade`    | pessoas     | Utilizadores únicos por cluster e período     |
| `congestionamento`    | `conectividade` | score 0-1   | Nível médio de congestionamento das antenas   |
| `download_bytes_gb`   | `conectividade` | GB          | Volume de dados descarregados no cluster      |
| `antenas_por_cluster` | `conectividade` | unidades    | Número de antenas ERB activas no cluster      |

Categorias disponíveis (para filtros):
`conectividade`, `mobilidade`, `emprego`, `formacao`,
`mentoria`, `saude_mental`, `estrutura_social`

Os últimos 4 estão reservados para fontes externas futuras (DATASUS, OMS).
No MVP, só `conectividade` e `mobilidade` têm dados.

---

### 3.3 `observations`

Tabela central do sistema. Uma linha por (região, indicador, data, período).

| Coluna         | Tipo          | Valores possíveis                               |
|----------------|---------------|-------------------------------------------------|
| `region_id`    | INTEGER       | FK → regions.id                                 |
| `indicator_id` | INTEGER       | FK → indicators.id                              |
| `source_id`    | INTEGER       | FK → sources.id                                 |
| `obs_date`     | DATE          | Datas do dataset (Março 2026, 15 dias)          |
| `period`       | TEXT          | `MADRUGADA`, `MANHA`, `TARDE`, `NOITE`, `ALL`  |
| `obs_value`    | NUMERIC(15,4) | Valor do indicador                              |
| `unit`         | TEXT          | Herdado do indicador                            |

**`period = 'ALL'`** → agregado sem período definido (ex: `antenas_por_cluster`).

---

### 3.4 `subscriber_demographics`

Perfil demográfico da população por cluster. Dados **agregados** — não há
registos individuais.

| Coluna            | Tipo    | Valores possíveis              |
|-------------------|---------|--------------------------------|
| `region_id`       | INTEGER | FK → regions.id                |
| `income_cluster`  | TEXT    | `A`, `B`, `C`, `D`            |
| `age_group`       | TEXT    | `18-24`, `25-34`, `35-44`, `45-54`, `55+` |
| `mobility_pattern`| TEXT    | `BAIXA`, `MODERADA`, `INTENSA` |
| `subscriber_count`| INTEGER | Total de assinantes nesta combinação |
| `flagship_count`  | INTEGER | Assinantes com perfil de uso intenso |

---

### 3.5 `od_flows`

Pares de deslocamento entre clusters, k-anonimizados (K=3).
Seguros para uso público sem restrições adicionais de privacidade.

| Coluna                | Tipo          | Notas                              |
|-----------------------|---------------|------------------------------------|
| `region_origem_id`    | INTEGER       | FK → regions.id                    |
| `region_destino_id`   | INTEGER       | FK → regions.id                    |
| `mesmo_cluster`       | BOOLEAN       | TRUE se origem = destino           |
| `n_usuarios`          | INTEGER       | Utilizadores neste par OD          |
| `n_viagens`           | INTEGER       | Total de viagens registadas        |
| `dist_media_km`       | NUMERIC(8,3)  | Distância média do percurso        |
| `periodo_predominante`| TEXT          | Período com mais movimento         |

---

## 4. Queries de referência

### 4.1 Regiões para o mapa (`GET /mapa`)

Devolve todas as regiões com os valores mais recentes de concentração
e cobertura — base para o mapa interactivo.

```sql
SELECT
    r.id,
    r.cluster_code                  AS regiao,
    r.municipio,
    r.lat,
    r.lng,
    r.lat IS NULL                   AS sem_cobertura,

    -- Concentração de pessoas (último dia disponível, período TARDE)
    conc.obs_value                  AS concentracao_pessoas,
    conc.obs_date                   AS data_referencia,

    -- Nível de congestionamento da rede
    cong.obs_value                  AS congestionamento_rede,

    -- Número de antenas no cluster
    ant.obs_value                   AS n_antenas

FROM regions r

-- Concentração: período TARDE, última data disponível
LEFT JOIN LATERAL (
    SELECT o.obs_value, o.obs_date
    FROM observations o
    JOIN indicators i ON i.id = o.indicator_id
    WHERE o.region_id = r.id
      AND i.indicator_name = 'n_usuarios'
      AND o.period = 'TARDE'
    ORDER BY o.obs_date DESC
    LIMIT 1
) conc ON TRUE

-- Congestionamento: período TARDE, última data disponível
LEFT JOIN LATERAL (
    SELECT o.obs_value
    FROM observations o
    JOIN indicators i ON i.id = o.indicator_id
    WHERE o.region_id = r.id
      AND i.indicator_name = 'congestionamento'
      AND o.period = 'TARDE'
    ORDER BY o.obs_date DESC
    LIMIT 1
) cong ON TRUE

-- Antenas: indicador estático
LEFT JOIN LATERAL (
    SELECT o.obs_value
    FROM observations o
    JOIN indicators i ON i.id = o.indicator_id
    WHERE o.region_id = r.id
      AND i.indicator_name = 'antenas_por_cluster'
    LIMIT 1
) ant ON TRUE

ORDER BY r.cluster_code;
```

---

### 4.2 Regiões com alta concentração e baixa cobertura

A pergunta principal do produto: onde estão as pessoas mas falta rede?

```sql
SELECT
    r.cluster_code,
    r.municipio,
    conc.obs_value   AS pessoas_tarde,
    ant.obs_value    AS n_antenas,
    cong.obs_value   AS congestionamento

FROM regions r

LEFT JOIN LATERAL (
    SELECT o.obs_value FROM observations o
    JOIN indicators i ON i.id = o.indicator_id
    WHERE o.region_id = r.id AND i.indicator_name = 'n_usuarios'
      AND o.period = 'TARDE'
    ORDER BY o.obs_date DESC LIMIT 1
) conc ON TRUE

LEFT JOIN LATERAL (
    SELECT o.obs_value FROM observations o
    JOIN indicators i ON i.id = o.indicator_id
    WHERE o.region_id = r.id AND i.indicator_name = 'antenas_por_cluster'
    LIMIT 1
) ant ON TRUE

LEFT JOIN LATERAL (
    SELECT o.obs_value FROM observations o
    JOIN indicators i ON i.id = o.indicator_id
    WHERE o.region_id = r.id AND i.indicator_name = 'congestionamento'
      AND o.period = 'TARDE'
    ORDER BY o.obs_date DESC LIMIT 1
) cong ON TRUE

WHERE conc.obs_value > 500       -- alta concentração de pessoas
  AND (ant.obs_value < 3         -- pouca cobertura de antenas
       OR ant.obs_value IS NULL) -- ou sem cobertura

ORDER BY conc.obs_value DESC;
```

---

### 4.3 Perfil demográfico de uma região (`POST /dados`)

```sql
SELECT
    r.cluster_code,
    r.municipio,
    sd.income_cluster,
    sd.age_group,
    sd.mobility_pattern,
    sd.subscriber_count,
    ROUND(100.0 * sd.subscriber_count /
          SUM(sd.subscriber_count) OVER (PARTITION BY r.id), 2) AS pct_cluster

FROM subscriber_demographics sd
JOIN regions r ON r.id = sd.region_id

WHERE r.cluster_code = 'CBD_BEIRAMAR'   -- substituir pelo filtro do request

ORDER BY sd.subscriber_count DESC;
```

---

### 4.4 Fluxos de saída de uma região

Quem sai e para onde vai?

```sql
SELECT
    r_dest.cluster_code     AS destino,
    r_dest.municipio        AS municipio_destino,
    f.n_usuarios,
    f.n_viagens,
    f.dist_media_km,
    f.periodo_predominante

FROM od_flows f
JOIN regions r_orig ON r_orig.id = f.region_origem_id
JOIN regions r_dest ON r_dest.id = f.region_destino_id

WHERE r_orig.cluster_code = 'CBD_BEIRAMAR'  -- substituir pelo filtro
  AND f.mesmo_cluster = FALSE

ORDER BY f.n_usuarios DESC;
```

---

### 4.5 Evolução de um indicador ao longo do tempo

```sql
SELECT
    o.obs_date,
    o.period,
    o.obs_value,
    i.unit

FROM observations o
JOIN indicators   i ON i.id = o.indicator_id
JOIN regions      r ON r.id = o.region_id

WHERE r.cluster_code    = 'UFSC'           -- substituir pelo filtro
  AND i.indicator_name  = 'n_usuarios'     -- substituir pelo indicador
  AND o.period          != 'ALL'

ORDER BY o.obs_date, o.period;
```

---

### 4.6 Listar indicadores disponíveis (`GET /indicadores`)

```sql
SELECT
    indicator_name,
    category,
    unit,
    description
FROM indicators
ORDER BY category, indicator_name;
```

---

### 4.7 Listar regiões disponíveis (`GET /regioes`)

```sql
SELECT
    id,
    cluster_code,
    municipio,
    lat,
    lng,
    lat IS NULL AS sem_cobertura
FROM regions
ORDER BY municipio, cluster_code;
```

---

## 5. O que o backend recebe por endpoint

### `GET /regioes`

```json
[
  {
    "id": 1,
    "cluster_code": "CBD_BEIRAMAR",
    "municipio": "FLORIANOPOLIS",
    "lat": -27.593,
    "lng": -48.548,
    "sem_cobertura": false
  },
  {
    "id": 5,
    "cluster_code": "ANTONIO_CARLOS",
    "municipio": "ANTONIO CARLOS",
    "lat": null,
    "lng": null,
    "sem_cobertura": true
  }
]
```

### `GET /indicadores`

```json
[
  {
    "indicator_name": "n_usuarios",
    "category": "mobilidade",
    "unit": "pessoas",
    "description": "Utilizadores únicos por cluster e período"
  }
]
```

### `GET /mapa`

Formato esperado para o frontend (conforme arquitectura):

```json
{
  "regioes": [
    {
      "regiao": "CBD_BEIRAMAR",
      "lat": -27.593,
      "lng": -48.548,
      "concentracao": 1240,
      "cobertura_rede": 8,
      "sem_cobertura": false,
      "indicadores": ["n_usuarios", "congestionamento", "antenas_por_cluster"]
    }
  ]
}
```

### `POST /dados`

O backend recebe o request, consulta a BD, e devolve ao frontend.
A IA (Hércules) interpreta o resultado e gera o campo `resposta_ia`.

Request:
```json
{
  "consulta": "Onde faltam antenas mas há muita gente?",
  "filtros": { "regiao": "FLORIANOPOLIS", "indicador": "conectividade" },
  "idioma": "pt"
}
```

O que a BD entrega ao backend para este tipo de consulta:

```json
[
  {
    "cluster_code": "PALHOCA_PRAIA",
    "municipio": "PALHOCA",
    "pessoas_tarde": 890,
    "n_antenas": 1,
    "congestionamento": 0.87
  }
]
```

---

## 6. Limitações conhecidas

| Limitação | Impacto | Mitigação futura |
|-----------|---------|------------------|
| Dataset cobre apenas Florianópolis | Não representa Angola nem outras regiões | Adicionar base regional África + LATAM |
| Dados sintéticos (não reais) | Padrões estatisticamente realistas mas não reais | Substituir por dados reais em produção |
| Sem dados de emprego, formação, saúde mental | Serviços 1, 2 e 5 ficam sem dados no MVP | Integrar DATASUS, OMS, bases regionais |
| Tabela `programs` vazia | Serviços 3 e 4 sem dados no MVP | Alimentar manualmente ou via API pública |
| Período do dataset: Março 2026, 15 dias | Sem análise sazonal nem anual | Expandir com mais dados no futuro |
| 4 clusters sem antenas (sem lat/lng) | Mapa não posiciona estas regiões | Geocodificar manualmente os centróides |

---

## 7. Notas técnicas importantes

**`ecgi` é sempre string** — nunca numérico. O pandas converte para float
por defeito e corrompe o identificador. O pipeline já trata isto.

**Municípios normalizados sem acentos** — `FLORIANOPOLIS`, `SAO JOSE`,
`PALHOCA`, `BIGUACU`. Filtros devem usar a mesma normalização.

**Cluster codes em maiúsculas com underscore** — ex: `CBD_BEIRAMAR`,
`UFSC`, `SAO_JOSE_KOBRASOL`. Nunca minúsculas.

**Period `ALL`** — usado apenas para indicadores sem variação por período
(ex: `antenas_por_cluster`). Não é um período do dia.

**Regiões sem cobertura têm `lat = NULL`** — o frontend deve tratar
este caso. São exactamente as regiões mais importantes para o produto.

---

## 8. Como adicionar uma nova fonte de dados

1. Inserir a fonte em `sources`
2. Inserir o novo indicador em `indicators`
3. Mapear as regiões da nova fonte para `cluster_code` em `regions`
4. Inserir observações em `observations` com o novo `indicator_id`
5. Actualizar este documento

Nenhuma tabela existente precisa de ser alterada.

---

*Dúvidas sobre os dados: fala com o Paulo.*  
*Dúvidas sobre os endpoints: fala com o Victor.*  
*Dúvidas sobre os prompts da IA: fala com o Hércules.*
