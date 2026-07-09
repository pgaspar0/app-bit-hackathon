# Data Contract — BiT App / Equipa 48

**Versão:** 1.1  
**Data Architect:** Paulo  
**Destinatários:** Victor (Backend), Hércules (IA), Paufer (Frontend)  
**Última actualização:** Julho 2026

---

## 1. Objectivo

Este documento define:

* os contratos de request/response actualmente implementados na API;
* os campos obrigatórios e opcionais por endpoint;
* as regras de interpretação por serviço no backend;
* limitações actuais e pontos de evolução.

É a referência oficial entre dados, backend, IA e frontend.

---

## 2. Contexto da base de dados

A base actual usa dados da Região Metropolitana de Florianópolis, com foco em conectividade e mobilidade (Vísent CDRView), e estrutura preparada para expandir para outras fontes.

### Tabelas principais

| Tabela | Uso principal |
|---|---|
| `regions` | Unidade geográfica base |
| `indicators` | Catálogo de indicadores e categorias |
| `observations` | Valores por região, indicador, data e período |
| `sources` | Proveniência dos dados |
| `coverage_points` | Infraestrutura de cobertura de rede |
| `query_logs` | Histórico de consultas ao endpoint `/dados` |

---

## 3. Contratos da API

### 3.1 POST /dados

Endpoint principal do produto. Recebe consulta, filtros opcionais e idioma, e devolve resposta estruturada para decisão pública.

#### Request

```json
{
  "consulta": "Onde devo priorizar formações?",
  "filtros": {
    "regiao": "FLORIANOPOLIS",
    "indicador": "conectividade",
    "servico": "formacoes"
  },
  "idioma": "pt"
}
```

#### Campos de request

| Campo | Tipo | Obrigatório | Notas |
|---|---|---|---|
| `consulta` | string | sim | Texto livre da pergunta |
| `filtros.regiao` | string | não | `cluster_code` ou `municipio` |
| `filtros.indicador` | string | não | `indicator_name` ou `category` |
| `filtros.servico` | string | não | `formacoes`, `empregabilidade`, `experiencias`, `mentorias`, `saude_mental` |
| `idioma` | string | não | default interno: `pt` |

#### Response

```json
{
  "resposta_ia": "A região X aparece como prioridade...",
  "resumo_executivo": "A consulta devolveu 18 registos em 6 regiões...",
  "prioridade_intervencao": "ALTA",
  "recomendacao": "Prioridade alta em Formações...",
  "estatisticas": {
    "total_registros": 18,
    "total_regioes": 6,
    "valor_medio": 46.2,
    "valor_minimo": 18,
    "valor_maximo": 82,
    "regiao_destaque": "CBD_BEIRAMAR"
  },
  "top_regioes": [
    {
      "regiao": "CBD_BEIRAMAR",
      "municipio": "FLORIANOPOLIS",
      "indicador": "n_usuarios",
      "valor": 82,
      "fonte": "Vísent CDRView",
      "data_referencia": "2026-03-14",
      "unidade": "pessoas",
      "lat": -27.593,
      "lng": -48.548,
      "sem_cobertura": false
    }
  ],
  "dados": [
    {
      "regiao": "CBD_BEIRAMAR",
      "municipio": "FLORIANOPOLIS",
      "indicador": "n_usuarios",
      "valor": 82,
      "fonte": "Vísent CDRView",
      "data_referencia": "2026-03-14",
      "unidade": "pessoas",
      "lat": -27.593,
      "lng": -48.548,
      "sem_cobertura": false
    }
  ],
  "fontes": ["Vísent CDRView"]
}
```

#### Notas de contrato

* O backend usa `SNAKE_CASE` global no JSON.
* `top_regioes` pode ser derivado de `dados` quando necessário.
* `resposta_ia` é resiliente: usa IA externa quando disponível e fallback local quando não estiver.

---

### 3.2 GET /mapa

Devolve leitura territorial para mapa interactivo.

#### Query params opcionais

| Param | Tipo | Notas |
|---|---|---|
| `servico` | string | Contexto temático do mapa |
| `indicador` | string | Força indicador/categoria específica |

#### Exemplo

`GET /mapa?servico=formacoes`

#### Response

```json
{
  "regioes": [
    {
      "regiao": "CBD_BEIRAMAR",
      "lat": -27.593,
      "lng": -48.548,
      "concentracao": 1240,
      "cobertura_rede": 8,
      "valor": 8,
      "indicador": "antenas_por_cluster",
      "sem_cobertura": false,
      "indicadores": ["n_usuarios", "congestionamento", "antenas_por_cluster"]
    }
  ]
}
```

#### Semântica dos campos

* `concentracao`: último valor de `n_usuarios` no período TARDE.
* `cobertura_rede`: valor de `antenas_por_cluster` (ALL).
* `valor` + `indicador`: leitura activa segundo `servico`/`indicador`.
* `sem_cobertura`: `lat` ou `lng` ausente.

---

### 3.3 GET /regioes

Lista todas as regiões com metadados cartográficos mínimos.

```json
[
  {
    "id": 1,
    "cluster_code": "CBD_BEIRAMAR",
    "municipio": "FLORIANOPOLIS",
    "lat": -27.593,
    "lng": -48.548,
    "sem_cobertura": false
  }
]
```

---

### 3.4 GET /indicadores

Lista catálogo de indicadores.

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

---

### 3.5 POST /ingestao/reprocessar

Aciona execução do script Python de ingestão. Endpoint de apoio operacional.

---

## 4. Regras de contexto por serviço

No backend, `filtros.servico` altera o conjunto prioritário de indicadores/categorias para consulta e ranking.

| Serviço | Contexto de leitura preferencial |
|---|---|
| `formacoes` | `formacao`, `antenas_por_cluster`, `conectividade` |
| `empregabilidade` | `emprego`, `n_usuarios`, `mobilidade` |
| `experiencias` | `estrutura_social`, `n_usuarios`, `mobilidade` |
| `mentorias` | `mentoria`, `n_usuarios`, `mobilidade` |
| `saude_mental` | `saude_mental`, `congestionamento`, `conectividade` |

Quando `filtros.indicador` for explicitamente enviado, ele tem prioridade sobre a regra do serviço.

---

## 5. Notas de modelagem e qualidade de dados

1. `lat`/`lng` podem ser `NULL` e isso representa ausência real de cobertura.
2. `period = ALL` é reservado para indicadores sem variação por período.
3. `cluster_code` e `municipio` são as chaves práticas de filtragem no backend.
4. Categorias sociais podem ainda operar por proxy no MVP quando não houver fonte dedicada.

---

## 6. Limitações actuais

| Limitação | Impacto | Mitigação |
|---|---|---|
| Base principal centrada em Florianópolis | baixa representatividade geográfica global | expandir fontes e regiões |
| Cobertura social incompleta em algumas categorias | parte dos serviços usa proxies | incorporar bases específicas (emprego, saúde, formação) |
| Testes automatizados de negócio ainda limitados | risco de regressão em evolução rápida | ampliar suite de integração por endpoint |

---

## 7. Guia de evolução do contrato

Sempre que houver mudança em payload de API:

1. actualizar DTO backend;
2. actualizar consumo do frontend;
3. actualizar este documento no mesmo ciclo;
4. validar build frontend e testes backend.

---

## 8. Próximos passos recomendados

1. consolidar testes de integração de `/dados` e `/mapa`;
2. enriquecer fontes para serviços sociais;
3. manter `filtros.servico` como eixo de leitura temática no frontend e backend;
4. evoluir explicabilidade da recomendação com critérios mais auditáveis.

---

*Dúvidas sobre dados: Paulo.*  
*Dúvidas sobre backend/contrato: Victor.*  
*Dúvidas sobre IA: Hércules.*
