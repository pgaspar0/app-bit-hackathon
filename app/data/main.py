import logging
import os
import sys
import psycopg2
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from fastapi import FastAPI, HTTPException, Request, status

# Agentspan/Conductor defaults to "spawn", which currently fails to pickle the
# generated tool worker wrappers in this app. Set this before importing Agentspan.
os.environ.setdefault("CONDUCTOR_MP_START_METHOD", "fork")

import multiprocessing
try:
    multiprocessing.set_start_method("fork", force=True)
except Exception:
    pass

from agentspan.agents import Agent, AgentRuntime, run, tool
app = FastAPI()

from tools import (
    load_env,
    connect_db,
    fetch_all,
    get_region_high_low_concent,
    get_demo_profile_region,
    get_leave_flow_region,
    get_evolution_indicator,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)




class Dado(BaseModel):
    regiao: str
    valor: str | None = None
    fonte: str | None = None

class ResponseModel(BaseModel):
    resposta_ia: str
    dados: list[Dado] = Field(default_factory=list)
    fontes: list[str] = Field(default_factory=list)

with open('AgentInst.txt', 'r', encoding='utf-8') as file:
    inst = file.read()

pesquisador = Agent(
    name="pesquisador",
    model="google_gemini/gemini-3.1-flash-lite",
    instructions=(inst),
    tools=[get_region_high_low_concent, get_demo_profile_region, get_leave_flow_region, get_evolution_indicator],
    output_type=ResponseModel,
)

@app.post('/webhook', status_code=status.HTTP_200_OK)
async def receive_webhook(request: Request):
    load_env()
    data = await request.json()
    print(f"Received webhook data: {data}")
    try:
        with AgentRuntime() as runtime:
            result = run(pesquisador, data, runtime=runtime)
            output = result.output
            if isinstance(output, ResponseModel):
                return output.model_dump()
            if isinstance(output, dict):
                # Agentspan sometimes wraps the ResponseModel dump in a 'result' key.
                if "result" in output and isinstance(output["result"], dict):
                    return output["result"]
                return output
            if hasattr(output, "get"):
                return output.get("resposta_ia", "Nenhuma resposta gerada pelo agente.")
            return {"resposta_ia": "Nenhuma resposta gerada pelo agente."}
    except Exception as exc:
        log.exception("Falha ao executar agente pesquisador.")
        raise HTTPException(status_code=502, detail=f"Falha no serviço de IA: {exc}") from exc
    
