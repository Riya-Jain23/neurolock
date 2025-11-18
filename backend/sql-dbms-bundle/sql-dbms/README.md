# NeuroLock SQL DBMS (MySQL + envelope encryption)

This bundle gives you a MySQL 8 instance (port 3306) with schema + triggers, and a small Python client that
does **per-record envelope encryption** for therapy notes using AES-256-GCM with an AES-256 KEK-wrapped DEK.

## 1) Start the DB
```bash
cd sql-dbms
docker compose up -d
# Adminer UI: http://localhost:8080  (server= mysql, user= app, pass= app123, db= neurolock)
```

The SQL in `db/init/` is applied automatically on first start.

## 2) Try the Python demo
```bash
cd sql-dbms/app
python -m venv .venv && source .venv/bin/activate  # (Windows: .venv\Scripts\activate)
pip install -r requirements.txt
cp .env.example .env   # or set your own KEK_HEX
python demo_insert.py
```

You should see the decrypted note printed back from the database.

## Table highlights
- `patients` — basic demographics (demo only)
- `therapy_notes` — **encrypted**: stores `dek_wrapped`, `iv`, `ciphertext`
- `medications` — sample clear-text table
- `audit_log` — append-only audit events; insert triggers for notes & meds
