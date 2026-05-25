"""
API для управления формами: создание, чтение, обновление, удаление.
Требует авторизации через токен сессии (X-Authorization).
"""
import json, os, uuid, psycopg2

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Authorization",
}

AUTH_URL = os.environ.get("YANDEX_AUTH_URL", "")

def db():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def ensure_tables():
    conn = db()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS forms (
            id TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL DEFAULT 'Новая форма',
            description TEXT DEFAULT '',
            fields JSONB NOT NULL DEFAULT '[]',
            settings JSONB NOT NULL DEFAULT '{}',
            status TEXT NOT NULL DEFAULT 'draft',
            slug TEXT UNIQUE NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS forms_user_id_idx ON forms(user_id);
        CREATE INDEX IF NOT EXISTS forms_slug_idx ON forms(slug);
    """)
    conn.commit()
    cur.close()
    conn.close()

def get_user(token: str):
    if not token:
        return None
    conn = db()
    cur = conn.cursor()
    cur.execute("""
        SELECT u.id, u.name, u.email FROM sessions s
        JOIN users u ON u.id = s.user_id
        WHERE s.token = %s AND s.expires_at > NOW()
    """, (token,))
    row = cur.fetchone()
    cur.close(); conn.close()
    if not row:
        return None
    return {"id": row[0], "name": row[1], "email": row[2]}

def gen_slug():
    return uuid.uuid4().hex[:10]

def resp(status, body, extra_headers=None):
    h = {**CORS, "Content-Type": "application/json"}
    if extra_headers:
        h.update(extra_headers)
    return {"statusCode": status, "headers": h, "body": json.dumps(body, default=str, ensure_ascii=False)}

def handler(event: dict, context) -> dict:
    """CRUD API для форм. GET=список, POST=создать, PUT=обновить, DELETE=удалить."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": {**CORS, "Access-Control-Max-Age": "86400"}, "body": ""}

    ensure_tables()

    method = event.get("httpMethod", "GET")
    qs = event.get("queryStringParameters") or {}
    auth = event.get("headers", {}).get("X-Authorization", "")
    token = auth.replace("Bearer ", "").strip()
    user = get_user(token)

    # GET ?id=xxx — получить форму по id (только владелец)
    if method == "GET" and qs.get("id") and not qs.get("slug"):
        if not user:
            return resp(401, {"error": "unauthorized"})
        form_id = qs["id"]
        conn = db()
        cur = conn.cursor()
        cur.execute("SELECT id, title, description, fields, settings, status, slug FROM forms WHERE id=%s AND user_id=%s", (form_id, user["id"]))
        row = cur.fetchone()
        cur.close(); conn.close()
        if not row:
            return resp(404, {"error": "not found"})
        return resp(200, {"id": row[0], "title": row[1], "description": row[2], "fields": row[3], "settings": row[4], "status": row[5], "slug": row[6]})

    # GET ?slug=xxx — публичный доступ к форме для заполнения
    if method == "GET" and qs.get("slug"):
        slug = qs["slug"]
        conn = db()
        cur = conn.cursor()
        cur.execute("SELECT id, title, description, fields, settings, status FROM forms WHERE slug=%s", (slug,))
        row = cur.fetchone()
        cur.close(); conn.close()
        if not row:
            return resp(404, {"error": "form not found"})
        if row[5] == "draft":
            return resp(403, {"error": "form is not published"})
        form = {"id": row[0], "title": row[1], "description": row[2], "fields": row[3], "settings": row[4], "status": row[5]}
        return resp(200, form)

    # Остальные методы требуют авторизации
    if not user:
        return resp(401, {"error": "unauthorized"})

    # GET — список форм пользователя
    if method == "GET":
        conn = db()
        cur = conn.cursor()
        cur.execute("""
            SELECT f.id, f.title, f.description, f.status, f.slug, f.created_at, f.updated_at,
                   (SELECT COUNT(*) FROM form_responses r WHERE r.form_id = f.id) as response_count
            FROM forms f WHERE f.user_id = %s ORDER BY f.updated_at DESC
        """, (user["id"],))
        rows = cur.fetchall()
        cur.close(); conn.close()
        forms = [{"id": r[0], "title": r[1], "description": r[2], "status": r[3],
                  "slug": r[4], "created_at": r[5], "updated_at": r[6], "response_count": r[7]} for r in rows]
        return resp(200, {"forms": forms})

    # POST — создать форму
    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        form_id = str(uuid.uuid4())
        slug = gen_slug()
        title = body.get("title", "Новая форма")
        fields = body.get("fields", [])
        description = body.get("description", "")
        settings = body.get("settings", {})
        conn = db()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO forms (id, user_id, title, description, fields, settings, slug)
            VALUES (%s, %s, %s, %s, %s::jsonb, %s::jsonb, %s)
            RETURNING id, title, slug, status, created_at
        """, (form_id, user["id"], title, description, json.dumps(fields), json.dumps(settings), slug))
        row = cur.fetchone()
        conn.commit(); cur.close(); conn.close()
        return resp(201, {"id": row[0], "title": row[1], "slug": row[2], "status": row[3], "created_at": row[4]})

    # PUT — обновить форму
    if method == "PUT":
        body = json.loads(event.get("body") or "{}")
        form_id = body.get("id")
        if not form_id:
            return resp(400, {"error": "id required"})
        conn = db()
        cur = conn.cursor()
        # Проверяем владельца
        cur.execute("SELECT user_id FROM forms WHERE id=%s", (form_id,))
        row = cur.fetchone()
        if not row or row[0] != user["id"]:
            cur.close(); conn.close()
            return resp(403, {"error": "forbidden"})
        # Обновляем только переданные поля
        updates = []
        vals = []
        if "title" in body:
            updates.append("title=%s"); vals.append(body["title"])
        if "description" in body:
            updates.append("description=%s"); vals.append(body["description"])
        if "fields" in body:
            updates.append("fields=%s::jsonb"); vals.append(json.dumps(body["fields"]))
        if "settings" in body:
            updates.append("settings=%s::jsonb"); vals.append(json.dumps(body["settings"]))
        if "status" in body:
            updates.append("status=%s"); vals.append(body["status"])
        if not updates:
            cur.close(); conn.close()
            return resp(400, {"error": "nothing to update"})
        updates.append("updated_at=NOW()")
        vals.append(form_id)
        cur.execute(f"UPDATE forms SET {', '.join(updates)} WHERE id=%s RETURNING id, title, slug, status, updated_at", vals)
        row = cur.fetchone()
        conn.commit(); cur.close(); conn.close()
        return resp(200, {"id": row[0], "title": row[1], "slug": row[2], "status": row[3], "updated_at": row[4]})

    # DELETE — удалить форму
    if method == "DELETE":
        form_id = qs.get("id")
        if not form_id:
            return resp(400, {"error": "id required"})
        conn = db()
        cur = conn.cursor()
        cur.execute("SELECT user_id FROM forms WHERE id=%s", (form_id,))
        row = cur.fetchone()
        if not row or row[0] != user["id"]:
            cur.close(); conn.close()
            return resp(403, {"error": "forbidden"})
        cur.execute("DELETE FROM forms WHERE id=%s", (form_id,))
        conn.commit(); cur.close(); conn.close()
        return resp(200, {"ok": True})

    return resp(405, {"error": "method not allowed"})