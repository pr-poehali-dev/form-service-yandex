"""
Яндекс OAuth авторизация.
Обменивает code на токен, получает профиль пользователя, возвращает сессию.
"""

import json
import os
import hashlib
import time
import urllib.request
import urllib.parse
import psycopg2


def get_db():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def ensure_tables():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            yandex_id TEXT UNIQUE NOT NULL,
            name TEXT,
            email TEXT,
            avatar_url TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
        );
    """)
    conn.commit()
    cur.close()
    conn.close()


def exchange_code(code: str, redirect_uri: str = "") -> dict:
    client_id = os.environ["YANDEX_CLIENT_ID"]
    client_secret = os.environ["YANDEX_CLIENT_SECRET"]
    # Используем redirect_uri из env (должен совпадать с Яндекс приложением)
    uri = os.environ.get("YANDEX_REDIRECT_URI", "") or redirect_uri
    params = {
        "grant_type": "authorization_code",
        "code": code,
        "client_id": client_id,
        "client_secret": client_secret,
    }
    if uri:
        params["redirect_uri"] = uri
    data = urllib.parse.urlencode(params).encode()
    req = urllib.request.Request(
        "https://oauth.yandex.ru/token",
        data=data,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())


def get_yandex_profile(access_token: str) -> dict:
    req = urllib.request.Request(
        "https://login.yandex.ru/info?format=json",
        headers={"Authorization": f"OAuth {access_token}"},
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())


def upsert_user(profile: dict) -> int:
    conn = get_db()
    cur = conn.cursor()
    yandex_id = str(profile["id"])
    name = profile.get("real_name") or profile.get("display_name") or profile.get("login", "")
    email = profile.get("default_email") or profile.get("emails", [None])[0] or ""
    avatar_url = ""
    if profile.get("default_avatar_id"):
        avatar_url = f"https://avatars.yandex.net/get-yapic/{profile['default_avatar_id']}/islands-200"

    cur.execute("""
        INSERT INTO users (yandex_id, name, email, avatar_url)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (yandex_id) DO UPDATE
            SET name = EXCLUDED.name, email = EXCLUDED.email, avatar_url = EXCLUDED.avatar_url
        RETURNING id
    """, (yandex_id, name, email, avatar_url))
    user_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return user_id


def create_session(user_id: int) -> str:
    token = hashlib.sha256(f"{user_id}-{time.time()}-{os.urandom(16).hex()}".encode()).hexdigest()
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO sessions (token, user_id) VALUES (%s, %s)",
        (token, user_id)
    )
    conn.commit()
    cur.close()
    conn.close()
    return token


def get_user_by_token(token: str) -> dict | None:
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        SELECT u.id, u.name, u.email, u.avatar_url, u.yandex_id
        FROM sessions s
        JOIN users u ON u.id = s.user_id
        WHERE s.token = %s AND s.expires_at > NOW()
    """, (token,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    if not row:
        return None
    return {"id": row[0], "name": row[1], "email": row[2], "avatar_url": row[3], "yandex_id": row[4]}


CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Authorization",
}


def handler(event: dict, context) -> dict:
    """Яндекс OAuth: обмен кода на сессию и получение профиля по токену."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": {**CORS, "Access-Control-Max-Age": "86400"}, "body": ""}

    ensure_tables()

    path = event.get("path", "/")
    method = event.get("httpMethod", "GET")

    qs = event.get("queryStringParameters") or {}

    # GET ?action=client_id — публичный client_id + redirect_uri для OAuth
    if qs.get("action") == "client_id" and method == "GET":
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({
            "client_id": os.environ.get("YANDEX_CLIENT_ID", ""),
            "redirect_uri": os.environ.get("YANDEX_REDIRECT_URI", ""),
        })}

    # GET ?action=me — вернуть текущего пользователя по токену
    if qs.get("action") == "me" and method == "GET":
        auth = event.get("headers", {}).get("X-Authorization", "")
        token = auth.replace("Bearer ", "").strip()
        if not token:
            return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "no token"})}
        user = get_user_by_token(token)
        if not user:
            return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "invalid token"})}
        return {"statusCode": 200, "headers": CORS, "body": json.dumps(user)}

    # POST / — обмен кода на сессию
    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        code = body.get("code")
        redirect_uri = body.get("redirect_uri", "")
        if not code:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "code required"})}

        print(f"[AUTH] code={code[:10]}... redirect_uri={redirect_uri}")
        token_data = exchange_code(code, redirect_uri)
        print(f"[AUTH] token_data keys={list(token_data.keys())}")
        access_token = token_data.get("access_token")
        if not access_token:
            print(f"[AUTH] FAILED: {token_data}")
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "token exchange failed", "detail": token_data})}

        profile = get_yandex_profile(access_token)
        user_id = upsert_user(profile)
        session_token = create_session(user_id)
        user = get_user_by_token(session_token)

        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"token": session_token, "user": user})}

    # DELETE / — выход (удаление сессии)
    if method == "DELETE":
        auth = event.get("headers", {}).get("X-Authorization", "")
        token = auth.replace("Bearer ", "").strip()
        if token:
            conn = get_db()
            cur = conn.cursor()
            cur.execute("DELETE FROM sessions WHERE token = %s", (token,))
            conn.commit()
            cur.close()
            conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "not found"})}