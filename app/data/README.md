# ANTES DE EXECUTAR, CRIA O BANCO (DOCKER-COMPOSE) E INGESTA OS DADOS(ingest.py)!! 

## Caso não reconhecer as chaves da API, execute isso no terminal (nesta pasta) antes de executar:
    $env:GEMINI_API_KEY="chavedeapi"
    $env:GOOGLE_CLOUD_PROJECT="chavedeapi"

## Outros modelos para usar:
    google_gemini/gemini-2.5-flash
    google_gemini/gemini-2.5-flash-lite

## Comandos útils
    uv run agentspan doctor
    uv run agentspan server start
    uv run agentspan server stop
## Execução: 
    uv run uvicorn main:app --reload

## Testar webhook:
    uv run .\webhook.py