import os
import sys
import psycopg2
import logging
from dotenv import load_dotenv
from agentspan.agents import tool

log = logging.getLogger(__name__)

def load_env():
    load_dotenv()
    required = [
        "DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD",
        "REFERENCIAS_DIR", "TENSORES_DIR",
    ]
    missing = [k for k in required if not os.getenv(k)]
    if missing:
        log.error(f"Variáveis em falta no .env: {missing}")
        sys.exit(1)

def connect_db():
    conn = psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
    )
    return conn

def fetch_all(query, params=None):
    conn = connect_db()
    try:
        with conn.cursor() as cur:
            cur.execute(query, params or ())
            return cur.fetchall()
    finally:
        conn.close()

@tool
def get_region_high_low_concent() -> dict:
    """Devolve Regiões com alta concentração e baixa cobertura """
    load_env()
    result = fetch_all("""
        SELECT
            r.cluster_code,
            r.municipio,
            conc.obs_value AS pessoas_tarde,
            ant.obs_value AS n_antenas,
            cong.obs_value AS congestionamento
        FROM regions r
        LEFT JOIN LATERAL (
            SELECT o.obs_value
            FROM observations o
            JOIN indicators i ON i.id = o.indicator_id
            WHERE o.region_id = r.id
              AND i.indicator_name = 'n_usuarios'
              AND o.period = 'TARDE'
            ORDER BY o.obs_date DESC
            LIMIT 1
        ) conc ON TRUE
        LEFT JOIN LATERAL (
            SELECT o.obs_value
            FROM observations o
            JOIN indicators i ON i.id = o.indicator_id
            WHERE o.region_id = r.id
              AND i.indicator_name = 'antenas_por_cluster'
            LIMIT 1
        ) ant ON TRUE
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
        WHERE conc.obs_value > 500
          AND (ant.obs_value < 3 OR ant.obs_value IS NULL)
        ORDER BY conc.obs_value DESC;
    """)
    if result:
        return {
            row[0]: {
                "municipio": row[1],
                "pessoas_tarde": float(row[2]) if row[2] is not None else None,
                "n_antenas": float(row[3]) if row[3] is not None else None,
                "congestionamento": float(row[4]) if row[4] is not None else None,
            }
            for row in result
        }
    return {"message": "Nenhuma região encontrada com alta concentração e baixa cobertura."}

@tool
def get_demo_profile_region(filtro) -> dict:
    """Devolve o perfil demográfico de uma região"""
    load_env()
    result = fetch_all("""
        SELECT
            r.cluster_code,
            r.municipio,
            sd.income_cluster,
            sd.age_group,
            sd.mobility_pattern,
            sd.subscriber_count,
            ROUND(100.0 * sd.subscriber_count / SUM(sd.subscriber_count) OVER (PARTITION BY r.id), 2) AS pct_cluster
        FROM subscriber_demographics sd
        JOIN regions r ON r.id = sd.region_id
        WHERE r.cluster_code = %s
        ORDER BY sd.subscriber_count DESC;
    """, (filtro,))
    if result:
        return {
            f"{row[0]}:{row[2]}:{row[3]}": {
                "municipio": row[1],
                "income_cluster": row[2],
                "age_group": row[3],
                "mobility_pattern": row[4],
                "subscriber_count": int(row[5]) if row[5] is not None else None,
                "pct_cluster": float(row[6]) if row[6] is not None else None,
            }
            for row in result
        }
    return {"message": "Nenhuma região encontrada com o perfil demográfico solicitado."}

@tool
def get_leave_flow_region(filtro) -> dict:
    """Devolve o fluxo de saída de uma região"""
    load_env()
    result = fetch_all("""
        SELECT
            r_dest.cluster_code AS destino,
            r_dest.municipio AS municipio_destino,
            f.n_usuarios,
            f.n_viagens,
            f.dist_media_km,
            f.periodo_predominante
        FROM od_flows f
        JOIN regions r_orig ON r_orig.id = f.region_origem_id
        JOIN regions r_dest ON r_dest.id = f.region_destino_id
        WHERE r_orig.cluster_code = %s
          AND f.mesmo_cluster = FALSE
        ORDER BY f.n_usuarios DESC;
    """, (filtro,))
    if result:
        return {
            row[0]: {
                "municipio_destino": row[1],
                "n_usuarios": int(row[2]) if row[2] is not None else None,
                "n_viagens": int(row[3]) if row[3] is not None else None,
                "dist_media_km": float(row[4]) if row[4] is not None else None,
                "periodo_predominante": row[5],
            }
            for row in result
        }
    return {"message": "Nenhuma região encontrada com o fluxo de saída solicitado."}

@tool
def get_evolution_indicator(filtro, indicador) -> dict:
    """Devolve a evolução de um indicador ao longo do tempo para uma região"""
    load_env()
    result = fetch_all("""
        SELECT o.obs_date, o.period, o.obs_value, i.unit
        FROM observations o
        JOIN indicators i ON i.id = o.indicator_id
        JOIN regions r ON r.id = o.region_id
        WHERE r.cluster_code = %s
          AND i.indicator_name = %s
          AND o.period != 'ALL'
        ORDER BY o.obs_date, o.period;
    """, (filtro, indicador))
    if result:
        return {
            f"{row[0]}:{row[1]}": {
                "data": row[0].isoformat() if hasattr(row[0], "isoformat") else str(row[0]),
                "periodo": row[1],
                "valor": float(row[2]) if row[2] is not None else None,
                "unidade": row[3],
            }
            for row in result
        }
    return {"message": "Nenhuma região encontrada com o indicador solicitado."}
