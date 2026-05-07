"""
Append rows from final_output_22 copy.xlsx (or a given .xlsx) into PostgreSQL table final_output_22
using a SQLAlchemy engine and pandas.to_sql (append).

  pip install pandas openpyxl sqlalchemy psycopg2-binary

  PowerShell (use $env: — CMD "set" does not set env vars for other processes in PS):
    $env:POSTGRES_DSN = "postgresql://user:pass@host:5432/dbname"
    py scripts/append_excel_to_postgres.py

  CMD.exe:
    set POSTGRES_DSN=postgresql://user:pass@host:5432/dbname
    py scripts/append_excel_to_postgres.py

  (Script lives in scripts/ — not the repo root. With .env.local you can run that py line with no $env: needed.)

  # or: py scripts/append_excel_to_postgres.py "C:\\path\\to\\file.xlsx"

  Optional: project root .env.local then .env (gitignored) with POSTGRES_DSN=...
    Aiven: append ?sslmode=require to the URL. Same folder as the Next app.
    Optional: POSTGRES_SCHEMA=phasexs (default target schema; or pass --schema phasexs)

  Connection: POSTGRES_DSN, DATABASE_URL, or PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE.
"""

from __future__ import annotations

import argparse
import os
import re
import sys
from datetime import date, datetime, time
from typing import Any
from urllib.parse import quote_plus

import pandas as pd
from sqlalchemy import Text, create_engine, text
from sqlalchemy.engine import Engine

# Column order must match the sheet header row 1 and your CREATE TABLE.
PG_COLUMNS: list[str] = [
    "NCT_ID",
    "Phase",
    "Enrollment",
    "Study_Start_Date",
    "Primary_Completion_Date",
    "Study_Completion_Date",
    "Duration_Year",
    "Participant_Groups_Arms",
    "Est. Launch date",
    "Dosing_Frequency",
    "Molecule Name",
    "Approved Biologics",
    "Reimbursement",
    "No. of trials",
    "ATC Code",
    "End point parameter",
    "Adherence rate",
    "Drug/Brand switch",
    "INDICATION",
    "Estimated incidence for 2025",
    "Approval Year",
    "Drug Price (drugs.com)",
    "Price Source URL",
    "Dosage/Strength",
    "Adverse Effect",
    "Location Other Than U.S.",
    "Sponsor",
    "Biologics/Biosimilar",
    "Age",
    "Pharmalogical Class",
    "Pharmacological class",
    "trial design",
    "Route of administration",
    "Technology",
    "Disease Condition",
    "Physician/Self Administered",
    "Primary End Point",
    "MARKET FORECAST 2023 (US$ Mn)",
    "MARKET FORECAST 2024 (US$ Mn)",
    "MARKET FORECAST 2025 (US$ Mn)",
    "MARKET FORECAST 2026 (US$ Mn)",
    "MARKET FORECAST 2027 (US$ Mn )",
]


def load_env_file(path: str) -> None:
    """Load KEY=value into os.environ if not already set. No python-dotenv dependency."""
    if not os.path.isfile(path):
        return
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if line.startswith("export "):
                line = line[7:].lstrip()
            if "=" not in line:
                continue
            k, v = line.split("=", 1)
            k = k.strip()
            v = v.strip()
            if len(v) >= 2 and v[0] in "\"'" and v[0] == v[-1]:
                v = v[1:-1]
            if k and k not in os.environ:
                os.environ[k] = v


def to_text(v: Any) -> str | None:
    """Store everything as plain text; empty -> NULL."""
    if v is None:
        return None
    if isinstance(v, float) and pd.isna(v):
        return None
    if isinstance(v, (datetime, date, time)):
        return v.isoformat()
    if isinstance(v, pd.Timestamp):
        if pd.isna(v):
            return None
        return v.isoformat()
    s = str(v).strip()
    if s == "" or s.lower() in ("nan", "none", "<na>"):
        return None
    return s


def sqlalchemy_url() -> str:
    dsn = os.environ.get("POSTGRES_DSN") or os.environ.get("DATABASE_URL")
    if dsn:
        s = dsn.strip()
        # Already has a SQLAlchemy driver (e.g. postgresql+psycopg2://)
        if "+" in s.split("://", 1)[0]:
            return s
        if s.startswith("postgres://"):
            return "postgresql+psycopg2://" + s[len("postgres://") :]
        if s.startswith("postgresql://"):
            return "postgresql+psycopg2://" + s[len("postgresql://") :]
        return s

    user = os.environ.get("PGUSER", "")
    password = os.environ.get("PGPASSWORD", "")
    host = os.environ.get("PGHOST", "localhost")
    port = os.environ.get("PGPORT", "5432")
    db = os.environ.get("PGDATABASE", "")
    if not db:
        raise SystemExit(
            "Set POSTGRES_DSN or DATABASE_URL, or PGDATABASE (with PGUSER, etc.).\n"
            "In PowerShell use:  $env:POSTGRES_DSN = \"postgresql://...\"\n"
            "(not  set KEY=value, which is CMD and does not export env vars in PS.)"
        )
    u = quote_plus(user)
    p = quote_plus(password) if password else ""
    return f"postgresql+psycopg2://{u}:{p}@{host}:{port}/{quote_plus(db)}"


def make_engine() -> Engine:
    return create_engine(
        sqlalchemy_url(),
        pool_pre_ping=True,
    )


def ensure_schema(engine: Engine, schema: str) -> None:
    """Create schema if needed. `schema` must be a simple identifier (letters, digits, _)."""
    if not re.match(r"^[A-Za-z_][A-Za-z0-9_]*$", schema):
        raise SystemExit(f"Invalid schema name: {schema!r}")
    quoted = '"' + schema.replace('"', '""') + '"'
    with engine.begin() as conn:
        conn.execute(text(f"CREATE SCHEMA IF NOT EXISTS {quoted}"))


def read_dataframe(path: str) -> pd.DataFrame:
    df = pd.read_excel(path, engine="openpyxl", header=0)

    def norm(s: str) -> str:
        return re.sub(r"\s+", " ", str(s).strip())

    col_map = {norm(c): c for c in df.columns}
    ordered: list[str] = []
    for want in PG_COLUMNS:
        if norm(want) in col_map:
            ordered.append(col_map[norm(want)])
        else:
            raise SystemExit(
                f"Column missing in Excel: {want!r}. "
                f"Found: {list(df.columns)[:5]}... ({len(df.columns)} cols)"
            )
    if len(df.columns) < len(PG_COLUMNS):
        raise SystemExit("Excel has fewer columns than expected.")

    out = df[ordered].copy()
    out.columns = PG_COLUMNS
    for c in out.columns:
        out[c] = out[c].map(to_text)
    return out


def main() -> int:
    root = os.path.normpath(
        os.path.join(os.path.dirname(__file__), os.pardir)
    )
    default_xlsx = os.path.join(root, "final_output_22 copy.xlsx")

    # Load env before argparse so POSTGRES_* defaults apply
    local_env = os.path.join(root, ".env.local")
    if os.path.isfile(local_env):
        load_env_file(local_env)
    load_env_file(os.path.join(root, ".env"))

    default_schema = os.environ.get("POSTGRES_SCHEMA", "phasexs").strip() or "phasexs"

    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument(
        "xlsx",
        nargs="?",
        default=default_xlsx,
        help=f"Path to .xlsx (default: {default_xlsx})",
    )
    p.add_argument(
        "--schema",
        default=default_schema,
        help="PostgreSQL schema (default: phasexs, or POSTGRES_SCHEMA). Use public for the default namespace.",
    )
    p.add_argument(
        "--table",
        default="final_output_22",
        help="Table name (default: final_output_22)",
    )
    p.add_argument(
        "--chunksize",
        type=int,
        default=500,
        help="Rows per batch in to_sql (default: 500).",
    )
    args = p.parse_args()

    if not os.path.isfile(args.xlsx):
        print("File not found:", args.xlsx, file=sys.stderr)
        return 1

    df = read_dataframe(args.xlsx)
    if len(df) == 0:
        print("No data rows to insert.", file=sys.stderr)
        return 1

    dtype = {c: Text() for c in PG_COLUMNS}

    schema = args.schema
    to_sql_schema = None if schema == "public" else schema

    engine = make_engine()
    try:
        if to_sql_schema:
            ensure_schema(engine, to_sql_schema)
        df.to_sql(
            name=args.table,
            schema=to_sql_schema,
            con=engine,
            if_exists="append",
            index=False,
            dtype=dtype,
            chunksize=args.chunksize,
            method="multi",
        )
    finally:
        engine.dispose()

    fq = f'"{to_sql_schema or "public"}"."{args.table}"'
    print(f"Appended {len(df)} row(s) to {fq} (SQLAlchemy + to_sql).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
