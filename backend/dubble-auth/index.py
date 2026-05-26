"""
Авторизация через Даббл ID.
Принимает токен от Даббл ID, получает профиль пользователя, создаёт сессию.
"""

import json
import os
import hashlib
import time
import urllib.request
import psycopg2


CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Authorization",
}

DUBBLE_API = "https://forms-dubble.ru/id/api"


def get_db():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def get_dubble_profile(access_token: str) -> dict:
    req = urllib.request.Request(
        f"{DUBBLE_API}/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())


def upsert_dubble_user(profile: dict) -> int:
    conn = get_db()
    cur = conn.cursor()
    dubble_id = str(profile.get("id") or profile.get("sub") or profile.get("user_id", ""))
    name = profile.get("name") or profile.get("display_name") or profile.get("login", "")
    email = profile.get("email", "")
    avatar_url = profile.get("avatar") or profile.get("avatar_url", "")

    cur.execute("""
        INSERT INTO users (dubble_id, name, email, avatar_url)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (dubble_id) DO UPDATE
            SET name = EXCLUDED.name, email = EXCLUDED.email, avatar_url = EXCLUDED.avatar_url
        RETURNING id
    """, (dubble_id, name, email, avatar_url))
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
        SELECT u.id, u.name, u.email, u.avatar_url, u.yandex_id, u.dubble_id
        FROM sessions s
        JOIN users u ON u.id = s.user_id
        WHERE s.token = %s AND s.expires_at > NOW()
    """, (token,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    if not row:
        return None
    return {
        "id": row[0], "name": row[1], "email": row[2],
        "avatar_url": row[3], "yandex_id": row[4], "dubble_id": row[5]
    }


def handler(event: dict, context) -> dict:
    """Авторизация через Даббл ID: обмен токена на сессию."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": {**CORS, "Access-Control-Max-Age": "86400"}, "body": ""}

    method = event.get("httpMethod", "GET")

    # POST / — принимаем access_token от Даббл ID, создаём сессию
    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        access_token = body.get("access_token")
        if not access_token:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "access_token required"})}

        try:
            profile = get_dubble_profile(access_token)
        except Exception as e:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "failed to get profile", "detail": str(e)})}

        user_id = upsert_dubble_user(profile)
        session_token = create_session(user_id)
        user = get_user_by_token(session_token)

        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"token": session_token, "user": user})}

    return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "not found"})}
