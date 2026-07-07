"""
ingest.py — Pipeline de Ingestão de Dados
BiT App / Hackathon Equipa 48 / Data Architect: Paulo

Popula o PostgreSQL com dados do dataset Vísent CDRView.

Ficheiros processados (por ordem de execução):
  referencias/antenas_flp.csv       → regions + coverage_points
  referencias/assinantes.csv        → regions (complemento) + subscriber_demographics
  tensores/tensor_concentracao.csv  → observations
  referencias/trajetos_comuns.csv   → od_flows

Ficheiros NÃO processados no MVP (demasiado grandes):
  tensores/tensor_mobilidade.csv    (2.7 GB — 16.8M linhas)
  tensores/tensor_sequencias.csv    (915 MB)

Uso:
  python ingest.py              # ingestão completa
  python ingest.py --validate   # só valida a BD, não ingere
"""

import os
import sys
import argparse
import unicodedata
import logging
from datetime import date
from pathlib import Path

import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv


# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)


# ── Catálogo de indicadores ───────────────────────────────────────────────────
# Definidos aqui no código — não vêm de nenhum CSV.
# São o catálogo fixo de métricas que o sistema conhece.
INDICATORS = [
    {
        "indicator_name": "n_usuarios",
        "category":       "mobilidade",
        "unit":           "pessoas",
        "description":    "Total de utilizadores únicos por cluster e período",
        "source_type":    "dataset",
    },
    {
        "indicator_name": "congestionamento",
        "category":       "conectividade",
        "unit":           "score 0-1",
        "description":    "Nível médio de congestionamento das antenas do cluster",
        "source_type":    "dataset",
    },
    {
        "indicator_name": "download_bytes_gb",
        "category":       "conectividade",
        "unit":           "GB",
        "description":    "Volume total de dados descarregados no cluster",
        "source_type":    "dataset",
    },
    {
        "indicator_name": "antenas_por_cluster",
        "category":       "conectividade",
        "unit":           "unidades",
        "description":    "Número de antenas ERB activas no cluster",
        "source_type":    "dataset",
    },
]


# ── Utilitários ───────────────────────────────────────────────────────────────

def normalize_text(text) -> str:
    """
    Remove acentos e diacríticos. Devolve em maiúsculas sem espaços extra.

    Como funciona:
      unicodedata.normalize('NFKD', text) decompõe cada caracter acentuado
      em dois: a letra base + o acento separado (ex: 'ó' → 'o' + '́').
      unicodedata.combining(c) detecta esses acentos soltos e filtramo-los.
      O resultado é o texto sem acentos.

    Exemplos:
      'Florianópolis'    → 'FLORIANOPOLIS'
      'São José'         → 'SAO JOSE'
      'SAO_JOSE_ROÇADO'  → 'SAO_JOSE_ROCADO'
    """
    if not isinstance(text, str):
        return text  # devolve None/NaN sem alterar
    nfkd = unicodedata.normalize("NFKD", text)
    sem_acentos = "".join(c for c in nfkd if not unicodedata.combining(c))
    return sem_acentos.strip().upper()


def load_env():
    """Carrega variáveis do .env e valida que estão todas presentes."""
    load_dotenv()
    required = [
        "DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD",
        "REFERENCIAS_DIR", "TENSORES_DIR",
    ]
    missing = [k for k in required if not os.getenv(k)]
    if missing:
        log.error(f"Variáveis em falta no .env: {missing}")
        sys.exit(1)
    log.info("Variáveis de ambiente carregadas.")


def connect_db():
    """Abre e devolve uma ligação ao PostgreSQL."""
    conn = psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
    )
    log.info(f"Ligado a: {os.getenv('DB_NAME')}@{os.getenv('DB_HOST')}")
    return conn


# ── Helpers para resolver IDs ─────────────────────────────────────────────────

def get_region_map(cur) -> dict:
    """Devolve {cluster_code: region_id} para resolver clusters em IDs."""
    cur.execute("SELECT cluster_code, id FROM regions")
    return {row[0]: row[1] for row in cur.fetchall()}


def get_indicator_map(cur) -> dict:
    """Devolve {indicator_name: indicator_id}."""
    cur.execute("SELECT indicator_name, id FROM indicators")
    return {row[0]: row[1] for row in cur.fetchall()}


def get_source_id(cur, source_name: str) -> int:
    """Devolve o id de uma fonte pelo nome. Falha se não existir."""
    cur.execute("SELECT id FROM sources WHERE source_name = %s", (source_name,))
    row = cur.fetchone()
    if not row:
        raise ValueError(f"Fonte não encontrada na BD: '{source_name}'")
    return row[0]


# ── Etapas de ingestão ────────────────────────────────────────────────────────

def ingest_sources(cur):
    """
    Insere as fontes de dados no sistema.
    ON CONFLICT DO NOTHING → seguro para re-executar sem duplicar.
    """
    log.info("Etapa 1/7 — Fontes de dados")

    rows = [
        ("Vísent CDRView", "dataset",
         "https://github.com/wongola-bit/appbit", 0.95),
        ("Anatel", "public",
         "https://www.anatel.gov.br", 0.99),
    ]
    execute_values(cur, """
        INSERT INTO sources (source_name, source_type, url, reliability_score)
        VALUES %s
        ON CONFLICT (source_name) DO NOTHING
    """, rows)
    log.info(f"  {len(rows)} fontes processadas.")


def ingest_indicators(cur):
    """
    Insere o catálogo de indicadores.
    Valores definidos em INDICATORS no topo deste ficheiro.
    """
    log.info("Etapa 2/7 — Indicadores")

    rows = [
        (i["indicator_name"], i["category"], i["unit"],
         i["description"], i["source_type"])
        for i in INDICATORS
    ]
    execute_values(cur, """
        INSERT INTO indicators
            (indicator_name, category, unit, description, source_type)
        VALUES %s
        ON CONFLICT (indicator_name) DO NOTHING
    """, rows)
    log.info(f"  {len(rows)} indicadores processados.")


def ingest_antenas(cur):
    """
    Lê antenas_flp.csv e popula:
      - regions         (clusters únicos, centróide = média das coordenadas das antenas)
      - coverage_points (uma linha por antena)

    Atenção: a coluna no CSV chama-se 'lon', o schema usa 'lng'.
    """
    log.info("Etapa 3/7 — Antenas → Regiões + Cobertura")

    path = Path(os.getenv("REFERENCIAS_DIR")) / "antenas_flp.csv"
    df = pd.read_csv(path, dtype={"ecgi": str})
    log.info(f"  {len(df)} antenas lidas.")

    # Normaliza texto para eliminar inconsistências entre ficheiros
    df["cluster"]   = df["cluster"].apply(normalize_text)
    df["municipio"] = df["municipio"].apply(normalize_text)

    source_id_anatel  = get_source_id(cur, "Anatel")
    source_id_visent  = get_source_id(cur, "Vísent CDRView")

    # ── Regiões ───────────────────────────────────────────────────────────────
    # Centróide de cada cluster = média das lat/lon das suas antenas
    centroids = df.groupby("cluster").agg(
        municipio=("municipio", "first"),
        lat=("lat", "mean"),
        lng=("lon", "mean"),         # 'lon' no CSV → 'lng' no schema
    ).reset_index()

    region_rows = [
        (row["cluster"], row["municipio"], "Brasil",
         round(row["lat"], 6), round(row["lng"], 6))
        for _, row in centroids.iterrows()
    ]
    execute_values(cur, """
        INSERT INTO regions (cluster_code, municipio, country, lat, lng)
        VALUES %s
        ON CONFLICT (cluster_code) DO UPDATE SET
            municipio = EXCLUDED.municipio,
            lat       = EXCLUDED.lat,
            lng       = EXCLUDED.lng
    """, region_rows)
    log.info(f"  {len(region_rows)} regiões inseridas/actualizadas.")

    # ── Antenas ───────────────────────────────────────────────────────────────
    region_map = get_region_map(cur)

    antena_rows = [
        (row["ecgi"], region_map[row["cluster"]],
         round(row["lat"], 6), round(row["lon"], 6), source_id_anatel)
        for _, row in df.iterrows()
        if row["cluster"] in region_map
    ]
    execute_values(cur, """
        INSERT INTO coverage_points (ecgi, region_id, lat, lng, source_id)
        VALUES %s
        ON CONFLICT (ecgi) DO NOTHING
    """, antena_rows)
    log.info(f"  {len(antena_rows)} antenas inseridas.")


def ingest_assinantes(cur):
    """
    Lê assinantes.csv e popula:
      - regions               (os 4 clusters sem antenas — ficam sem lat/lng)
      - subscriber_demographics (dados AGREGADOS, não individuais)

    Os 200K registos são agrupados por
    (home_cluster, income_cluster, age_group, mobility_pattern)
    antes de entrar na BD → máx ~1.600 linhas.
    """
    log.info("Etapa 4/7 — Assinantes → Regiões complemento + Demografia")

    path = Path(os.getenv("REFERENCIAS_DIR")) / "assinantes.csv"
    df = pd.read_csv(path)
    log.info(f"  {len(df)} assinantes lidos.")

    df["home_cluster"]   = df["home_cluster"].apply(normalize_text)
    df["home_municipio"] = df["home_municipio"].apply(normalize_text)

    source_id = get_source_id(cur, "Vísent CDRView")

    # ── Clusters que existem aqui mas não em antenas_flp ─────────────────────
    # São os 4 clusters sem cobertura de rede.
    # Entram na tabela regions mas sem lat/lng — é o dado mais importante:
    # mostra onde falta infraestrutura antes de chegar a programas sociais.
    region_map = get_region_map(cur)
    novos = (
        df[~df["home_cluster"].isin(region_map)]
        [["home_cluster", "home_municipio"]]
        .drop_duplicates()
    )
    if not novos.empty:
        execute_values(cur, """
            INSERT INTO regions (cluster_code, municipio, country)
            VALUES %s
            ON CONFLICT (cluster_code) DO NOTHING
        """, [(r["home_cluster"], r["home_municipio"], "Brasil")
              for _, r in novos.iterrows()])
        log.info(f"  {len(novos)} regiões sem cobertura inseridas.")

    # ── Agregação demográfica ─────────────────────────────────────────────────
    region_map = get_region_map(cur)  # recarrega com os novos clusters

    agg = df.groupby(
        ["home_cluster", "income_cluster", "age_group", "mobility_pattern"],
        as_index=False,
    ).agg(
        subscriber_count=("assinante_hash", "count"),
        flagship_count=("flag_flagship", "sum"),
    )

    demo_rows = []
    for _, row in agg.iterrows():
        cluster = row["home_cluster"]
        if cluster not in region_map:
            log.warning(f"  Cluster não mapeado: {cluster}. A ignorar.")
            continue
        demo_rows.append((
            region_map[cluster],
            row["income_cluster"],
            row["age_group"],
            row["mobility_pattern"],
            int(row["subscriber_count"]),
            int(row["flagship_count"]),
            source_id,
        ))

    execute_values(cur, """
        INSERT INTO subscriber_demographics
            (region_id, income_cluster, age_group, mobility_pattern,
             subscriber_count, flagship_count, source_id)
        VALUES %s
        ON CONFLICT (region_id, income_cluster, age_group, mobility_pattern)
        DO UPDATE SET
            subscriber_count = EXCLUDED.subscriber_count,
            flagship_count   = EXCLUDED.flagship_count
    """, demo_rows)
    log.info(f"  {len(demo_rows)} combinações demográficas inseridas/actualizadas.")


def ingest_concentracao(cur):
    """
    Lê tensor_concentracao.csv e popula observations.

    O ficheiro tem dados ao nível de antena (ecgi).
    O pipeline agrega para o nível de cluster antes de gravar.

    Por cada (cluster, day_date, periodo) produz 3 observações:
      - n_usuarios        (soma das antenas do cluster)
      - congestionamento  (média das antenas do cluster)
      - download_bytes_gb (soma convertida de bytes para GB)

    Colunas confirmadas via documento técnico:
      ecgi, cluster, municipio, day_date, periodo,
      n_usuarios, download_bytes, congestionamento_medio
    """
    log.info("Etapa 5/7 — Concentração → Observações")

    path = Path(os.getenv("TENSORES_DIR")) / "tensor_concentracao.csv"
    df = pd.read_csv(path, dtype={"ecgi": str})
    log.info(f"  {len(df)} linhas lidas.")

    # Verifica se as colunas esperadas existem
    expected = {
        "ecgi", "cluster", "municipio", "day_date",
        "periodo", "n_usuarios", "download_bytes", "congestionamento_medio",
    }
    missing_cols = expected - set(df.columns)
    if missing_cols:
        log.warning(f"  Colunas não encontradas: {missing_cols}")
        log.warning("  Verifica os nomes exactos das colunas no ficheiro.")

    df["cluster"]   = df["cluster"].apply(normalize_text)
    df["municipio"] = df["municipio"].apply(normalize_text)
    df["day_date"]  = pd.to_datetime(df["day_date"]).dt.date

    region_map    = get_region_map(cur)
    indicator_map = get_indicator_map(cur)
    source_id     = get_source_id(cur, "Vísent CDRView")

    # Agrega de antena para cluster
    agg = df.groupby(["cluster", "day_date", "periodo"], as_index=False).agg(
        n_usuarios=("n_usuarios",            "sum"),
        congestionamento=("congestionamento_medio", "mean"),
        download_bytes=("download_bytes",      "sum"),
    )

    obs_rows = []
    for _, row in agg.iterrows():
        cluster = row["cluster"]
        if cluster not in region_map:
            continue

        region_id = region_map[cluster]
        obs_date  = row["day_date"]
        period    = row["periodo"]

        obs_rows += [
            (region_id, indicator_map["n_usuarios"],
             source_id, obs_date, period,
             round(float(row["n_usuarios"]), 4), "pessoas", None),

            (region_id, indicator_map["congestionamento"],
             source_id, obs_date, period,
             round(float(row["congestionamento"]), 6), "score 0-1", None),

            (region_id, indicator_map["download_bytes_gb"],
             source_id, obs_date, period,
             round(float(row["download_bytes"]) / 1e9, 6), "GB", None),
        ]

    # Grava em lotes de 1000 linhas para não sobrecarregar a memória
    total   = 0
    batch_size = 1000
    for i in range(0, len(obs_rows), batch_size):
        execute_values(cur, """
            INSERT INTO observations
                (region_id, indicator_id, source_id, obs_date, period,
                 obs_value, unit, metadata)
            VALUES %s
            ON CONFLICT (region_id, indicator_id, obs_date, period)
            DO UPDATE SET obs_value = EXCLUDED.obs_value
        """, obs_rows[i : i + batch_size])
        total += len(obs_rows[i : i + batch_size])

    log.info(f"  {total} observações inseridas/actualizadas.")


def ingest_od_flows(cur):
    """
    Lê trajetos_comuns.csv e popula od_flows.
    Resolve cluster_origem e cluster_destino para region_id via region_map.
    """
    log.info("Etapa 6/7 — Fluxos OD")

    path = Path(os.getenv("REFERENCIAS_DIR")) / "trajetos_comuns.csv"
    df = pd.read_csv(path)
    log.info(f"  {len(df)} pares OD lidos.")

    df["cluster_origem"]  = df["cluster_origem"].apply(normalize_text)
    df["cluster_destino"] = df["cluster_destino"].apply(normalize_text)

    region_map = get_region_map(cur)
    source_id  = get_source_id(cur, "Vísent CDRView")

    flow_rows = []
    skipped   = 0
    for _, row in df.iterrows():
        origem  = row["cluster_origem"]
        destino = row["cluster_destino"]

        if origem not in region_map or destino not in region_map:
            log.warning(f"  Cluster não mapeado: {origem} → {destino}. A ignorar.")
            skipped += 1
            continue

        dist = (round(float(row["dist_media_km"]), 3)
                if pd.notna(row["dist_media_km"]) else None)

        flow_rows.append((
            region_map[origem],
            region_map[destino],
            bool(int(row["mesmo_cluster"])),
            int(row["n_usuarios"]),
            int(row["n_viagens"]),
            dist,
            row["periodo_predominante"],
            source_id,
        ))

    execute_values(cur, """
        INSERT INTO od_flows
            (region_origem_id, region_destino_id, mesmo_cluster,
             n_usuarios, n_viagens, dist_media_km,
             periodo_predominante, source_id)
        VALUES %s
        ON CONFLICT (region_origem_id, region_destino_id) DO UPDATE SET
            n_usuarios           = EXCLUDED.n_usuarios,
            n_viagens            = EXCLUDED.n_viagens,
            dist_media_km        = EXCLUDED.dist_media_km,
            periodo_predominante = EXCLUDED.periodo_predominante
    """, flow_rows)
    log.info(f"  {len(flow_rows)} fluxos inseridos/actualizados. {skipped} ignorados.")


def ingest_antenas_count(cur):
    """
    Calcula e insere o indicador 'antenas_por_cluster'.

    Este indicador não vem de um CSV — é calculado directamente
    a partir da tabela coverage_points já populada.
    Usa a data máxima das observações como data de referência.
    """
    log.info("Etapa 7/7 — Contagem de antenas por cluster")

    # Data de referência = última data do dataset
    cur.execute("SELECT MAX(obs_date) FROM observations")
    result   = cur.fetchone()
    ref_date = result[0] if result[0] else date.today()

    indicator_map = get_indicator_map(cur)
    source_id     = get_source_id(cur, "Anatel")

    cur.execute("""
        SELECT region_id, COUNT(*) AS total
        FROM coverage_points
        GROUP BY region_id
    """)
    rows = cur.fetchall()

    obs_rows = [
        (region_id, indicator_map["antenas_por_cluster"],
         source_id, ref_date, "ALL", total, "unidades", None)
        for region_id, total in rows
    ]
    execute_values(cur, """
        INSERT INTO observations
            (region_id, indicator_id, source_id, obs_date, period,
             obs_value, unit, metadata)
        VALUES %s
        ON CONFLICT (region_id, indicator_id, obs_date, period)
        DO UPDATE SET obs_value = EXCLUDED.obs_value
    """, obs_rows)
    log.info(f"  {len(obs_rows)} regiões com contagem de antenas gravadas.")


# ── Validação ─────────────────────────────────────────────────────────────────

def validate(cur):
    """
    Confirma a integridade dos dados após a ingestão.
    Imprime um resumo de cada tabela e dos indicadores disponíveis.
    """
    log.info("A validar a base de dados...")

    checks = [
        ("sources",                  "SELECT COUNT(*) FROM sources"),
        ("regions (total)",          "SELECT COUNT(*) FROM regions"),
        ("regions sem cobertura",    "SELECT COUNT(*) FROM regions WHERE lat IS NULL"),
        ("indicators",               "SELECT COUNT(*) FROM indicators"),
        ("coverage_points",          "SELECT COUNT(*) FROM coverage_points"),
        ("observations",             "SELECT COUNT(*) FROM observations"),
        ("subscriber_demographics",  "SELECT COUNT(*) FROM subscriber_demographics"),
        ("od_flows",                 "SELECT COUNT(*) FROM od_flows"),
    ]

    print("\n" + "=" * 52)
    print("  RESUMO DA BASE DE DADOS")
    print("=" * 52)
    for label, query in checks:
        cur.execute(query)
        count = cur.fetchone()[0]
        status = " ⚠" if count == 0 else ""
        print(f"  {label:<30} {count:>6} registos{status}")
    print("=" * 52)

    cur.execute("""
        SELECT i.indicator_name, COUNT(*) AS total
        FROM observations o
        JOIN indicators i ON i.id = o.indicator_id
        GROUP BY i.indicator_name
        ORDER BY i.indicator_name
    """)
    rows = cur.fetchall()
    print("\n  OBSERVAÇÕES POR INDICADOR")
    print("=" * 52)
    for name, count in rows:
        print(f"  {name:<30} {count:>6} registos")
    print("=" * 52 + "\n")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Pipeline de ingestão — BiT App")
    parser.add_argument(
        "--validate", action="store_true",
        help="Apenas valida a BD sem ingerir dados"
    )
    args = parser.parse_args()

    load_env()
    conn = connect_db()

    try:
        with conn.cursor() as cur:

            if args.validate:
                validate(cur)
                return

            # Cada etapa tem o seu commit.
            # Se uma etapa falhar, só essa etapa faz rollback —
            # o que foi gravado nas etapas anteriores fica seguro.

            ingest_sources(cur);     conn.commit()
            ingest_indicators(cur);  conn.commit()
            ingest_antenas(cur);     conn.commit()
            ingest_assinantes(cur);  conn.commit()
            ingest_concentracao(cur); conn.commit()
            ingest_od_flows(cur);    conn.commit()
            ingest_antenas_count(cur); conn.commit()

            validate(cur)
            log.info("✓ Ingestão concluída com sucesso.")

    except Exception as e:
        conn.rollback()
        log.error(f"Erro durante a ingestão: {e}")
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    main()
