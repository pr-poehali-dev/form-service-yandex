"""
API для ответов на формы: сохранение публичных ответов и просмотр владельцем.
"""
import json, os, uuid, psycopg2
from datetime import datetime

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Authorization",
}

def db():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def ensure_tables():
    conn = db()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS form_responses (
            id TEXT PRIMARY KEY,
            form_id TEXT NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
            data JSONB NOT NULL DEFAULT '{}',
            respondent_name TEXT DEFAULT '',
            respondent_email TEXT DEFAULT '',
            ip TEXT DEFAULT '',
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS form_responses_form_id_idx ON form_responses(form_id);
    """)
    conn.commit()
    cur.close(); conn.close()

def get_user(token: str):
    if not token:
        return None
    conn = db()
    cur = conn.cursor()
    cur.execute("""
        SELECT u.id FROM sessions s JOIN users u ON u.id = s.user_id
        WHERE s.token=%s AND s.expires_at > NOW()
    """, (token,))
    row = cur.fetchone()
    cur.close(); conn.close()
    return {"id": row[0]} if row else None

def resp(status, body):
    return {"statusCode": status, "headers": {**CORS, "Content-Type": "application/json"},
            "body": json.dumps(body, default=str, ensure_ascii=False)}

def handler(event: dict, context) -> dict:
    """Ответы форм: POST=сохранить (публично), GET=список (для владельца), DELETE=удалить."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": {**CORS, "Access-Control-Max-Age": "86400"}, "body": ""}

    ensure_tables()
    method = event.get("httpMethod", "GET")
    qs = event.get("queryStringParameters") or {}
    auth = event.get("headers", {}).get("X-Authorization", "")
    token = auth.replace("Bearer ", "").strip()

    # POST — сохранить ответ (публичный, без авторизации)
    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        form_id = body.get("form_id")
        if not form_id:
            return resp(400, {"error": "form_id required"})
        # Проверяем что форма существует и активна
        conn = db()
        cur = conn.cursor()
        cur.execute("SELECT status FROM forms WHERE id=%s", (form_id,))
        row = cur.fetchone()
        if not row:
            cur.close(); conn.close()
            return resp(404, {"error": "form not found"})
        if row[0] == "draft":
            cur.close(); conn.close()
            return resp(403, {"error": "form not accepting responses"})
        resp_id = str(uuid.uuid4())
        data = body.get("data", {})
        name = body.get("name", "")
        email = body.get("email", "")
        ip = event.get("requestContext", {}).get("identity", {}).get("sourceIp", "")
        cur.execute("""
            INSERT INTO form_responses (id, form_id, data, respondent_name, respondent_email, ip)
            VALUES (%s, %s, %s::jsonb, %s, %s, %s)
        """, (resp_id, form_id, json.dumps(data), name, email, ip))
        conn.commit(); cur.close(); conn.close()
        return resp(201, {"ok": True, "id": resp_id})

    # GET — список ответов (только владелец)
    if method == "GET":
        user = get_user(token)
        if not user:
            return resp(401, {"error": "unauthorized"})
        form_id = qs.get("form_id")
        if not form_id:
            return resp(400, {"error": "form_id required"})
        # Проверяем владельца
        conn = db()
        cur = conn.cursor()
        cur.execute("SELECT user_id FROM forms WHERE id=%s", (form_id,))
        row = cur.fetchone()
        if not row or row[0] != user["id"]:
            cur.close(); conn.close()
            return resp(403, {"error": "forbidden"})
        cur.execute("""
            SELECT id, data, respondent_name, respondent_email, created_at
            FROM form_responses WHERE form_id=%s ORDER BY created_at DESC LIMIT 200
        """, (form_id,))
        rows = cur.fetchall()
        cur.close(); conn.close()
        responses = [{"id": r[0], "data": r[1], "name": r[2], "email": r[3], "created_at": r[4]} for r in rows]
        return resp(200, {"responses": responses})

    # DELETE — удалить ответ (только владелец)
    if method == "DELETE":
        user = get_user(token)
        if not user:
            return resp(401, {"error": "unauthorized"})
        resp_id = qs.get("id")
        if not resp_id:
            return resp(400, {"error": "id required"})
        conn = db()
        cur = conn.cursor()
        cur.execute("""
            DELETE FROM form_responses r USING forms f
            WHERE r.id=%s AND r.form_id=f.id AND f.user_id=%s
        """, (resp_id, user["id"]))
        conn.commit(); cur.close(); conn.close()
        return resp(200, {"ok": True})

    return resp(405, {"error": "method not allowed"})
