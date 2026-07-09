# Hackathon BiT - Equipa 48 - Arquitectura

## 1. Objectivo do documento

Este documento descreve a arquitectura actual do projecto BiT, alinhada com o estado implementado no repositório, com foco em:

* visão de produto e fluxo principal do MVP;
* stack técnica efectivamente usada;
* contratos entre frontend, backend e dados;
* decisões de escalabilidade e simplicidade operacional;
* próximos passos de evolução sem quebrar o que já funciona.

Data de actualização: Julho 2026.

---

## 2. Princípios da arquitectura

1. MVP-first: entregar valor demonstrável para demo day.
2. Monólito modular: um único repositório com separação clara por camadas.
3. API contract-first: frontend e backend evoluem por contratos JSON estáveis.
4. Data-driven UI: o frontend depende de dados da API, não de geografia fixa.
5. Fallback resiliente: o fluxo de consulta não depende de IA externa para funcionar.
6. Escalabilidade evolutiva: novos indicadores, regiões e fontes sem refactor total.

---

## 3. Stack implementada

### Frontend

* React 19
* Vite
* Tailwind CSS
* Leaflet

### Backend

* Spring Boot 3.5.x
* Spring Data JPA
* PostgreSQL

### Dados e ingestão

* Python (pipeline de ingestão e normalização)
* SQL schema versionado em `app/data/schema.sql`

### Deploy (MVP)

* Separação lógica entre frontend, backend e dados dentro do mesmo repositório
* Pronto para subir em Railway/Render com variáveis de ambiente

---

## 4. Visão geral da solução

```text
Fontes de dados (Vísent CDRView + complementares)
        |
        v
Pipeline Python (ingestão, limpeza, normalização)
        |
        v
PostgreSQL (modelo relacional)
        |
        v
Backend Spring Boot (APIs, regras de negócio, agregações)
        |
        v
Frontend React (consulta, evidência, território, recomendação)
```

---

## 5. Estrutura de módulos

### 5.1 Frontend

Estrutura principal:

* `app/frontend/src/components/DashboardLayout.jsx`
* `app/frontend/src/components/SidebarConsulta.jsx`
* `app/frontend/src/components/EvidencePanel.jsx`
* `app/frontend/src/components/MapaInterativo.jsx`
* `app/frontend/src/services/dadosApi.js`
* `app/frontend/src/config/product.js`

Fluxo implementado na UI:

1. pergunta em linguagem natural;
2. resposta estruturada com evidências;
3. leitura territorial no mapa;
4. recomendação para decisão pública.

### 5.2 Backend

Principais responsabilidades implementadas:

* validar e processar `POST /dados`;
* enriquecer resposta com resumo, prioridade, recomendação e estatísticas;
* aplicar contexto por serviço para priorização e leitura de indicadores;
* expor catálogos (`/regioes`, `/indicadores`) e mapa (`/mapa`);
* manter fallback local para interpretação quando IA externa não estiver disponível.

### 5.3 Dados

Camadas mantidas:

* Raw: dados de origem;
* Clean: normalização e validações;
* Business: dados prontos para API e mapa.

---

## 6. Endpoints implementados

### 6.1 POST /dados

Request:

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

Response (estrutura actual):

```json
{
  "resposta_ia": "...",
  "resumo_executivo": "...",
  "prioridade_intervencao": "ALTA",
  "recomendacao": "...",
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

### 6.2 GET /mapa

Suporta query params opcionais:

* `servico`
* `indicador`

Exemplo:

`GET /mapa?servico=formacoes`

Response:

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
      "indicadores": ["n_usuarios", "antenas_por_cluster", "congestionamento"]
    }
  ]
}
```

### 6.3 GET /regioes

Lista regiões com flag de cobertura cartográfica (`sem_cobertura`).

### 6.4 GET /indicadores

Lista catálogo de indicadores (`indicator_name`, `category`, `unit`, `description`).

### 6.5 POST /ingestao/reprocessar

Tenta executar o pipeline Python de ingestão e responde estado de execução.

---

## 7. Integração frontend-backend

Estado actual:

* frontend consome `/dados`, `/mapa`, `/regioes` e `/indicadores`;
* `filtros.servico` já está ligado ao backend;
* fallback de UI usa o mesmo contrato da resposta real;
* mapa funciona com dados de `GET /mapa` e fallback para `dados` de `/dados`.

Condição de sucesso no frontend:

* não depender de geografia fixa;
* suportar ausência de coordenadas;
* manter fluxo completo mesmo com API de IA indisponível.

---

## 8. Escalabilidade e limites conhecidos

### 8.1 O que já escala bem

* inclusão de novos indicadores e categorias sem mudar o contrato base;
* expansão para novas regiões mantendo o mesmo frontend;
* evolução de regra de priorização por serviço no backend;
* substituição de fallback por IA real sem quebrar `/dados`.

### 8.2 Limites actuais do MVP

* dataset principal ainda concentrado em Florianópolis;
* serviços sociais (formação/mentoria/saúde mental) dependem de indicadores proxy quando não há fonte dedicada;
* cobertura de testes ainda mínima para regras de negócio do backend.

---

## 9. Prioridades de evolução

1. Sincronizar documentação e código sempre que o contrato mudar.
2. Fortalecer testes de integração dos endpoints principais.
3. Completar fontes externas para categorias sociais além de conectividade/mobilidade.
4. Melhorar explicabilidade das recomendações (fontes + critério aplicado).
5. Preparar camada de deploy com variáveis e observabilidade para demo e pós-demo.

---

## 10. Resumo executivo

O BiT já está implementado como plataforma de decisão pública orientada a dados, com frontend React data-driven e backend Spring com respostas estruturadas para análise territorial.

O núcleo funcional do MVP está activo. O próximo salto é robustez de produção: testes, expansão de fontes e consolidação de contratos.
