"""
Загрузка файлов в S3. Принимает base64, возвращает публичный CDN URL.
"""
import json
import os
import base64
import uuid
import boto3

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Authorization",
}

ALLOWED_TYPES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/vnd.ms-excel": "xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "text/plain": "txt",
}

MAX_SIZE_MB = 10


def resp(status, body):
    return {
        "statusCode": status,
        "headers": {**CORS, "Content-Type": "application/json"},
        "body": json.dumps(body, ensure_ascii=False),
    }


def handler(event: dict, context) -> dict:
    """Загрузка файла в S3: принимает base64 + mime_type, возвращает CDN URL."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": {**CORS, "Access-Control-Max-Age": "86400"}, "body": ""}

    if event.get("httpMethod") != "POST":
        return resp(405, {"error": "method not allowed"})

    body = json.loads(event.get("body") or "{}")
    file_data = body.get("file")
    mime_type = body.get("mime_type", "application/octet-stream")
    original_name = body.get("name", "file")

    if not file_data:
        return resp(400, {"error": "file required"})

    if mime_type not in ALLOWED_TYPES:
        return resp(400, {"error": f"unsupported file type: {mime_type}"})

    try:
        raw = base64.b64decode(file_data)
    except Exception:
        return resp(400, {"error": "invalid base64"})

    size_mb = len(raw) / (1024 * 1024)
    if size_mb > MAX_SIZE_MB:
        return resp(400, {"error": f"file too large, max {MAX_SIZE_MB}MB"})

    ext = ALLOWED_TYPES[mime_type]
    file_key = f"form-uploads/{uuid.uuid4().hex}.{ext}"

    s3 = boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )
    s3.put_object(
        Bucket="files",
        Key=file_key,
        Body=raw,
        ContentType=mime_type,
        ACL="public-read",
    )

    project_id = os.environ["AWS_ACCESS_KEY_ID"]
    cdn_url = f"https://cdn.poehali.dev/projects/{project_id}/bucket/{file_key}"

    return resp(200, {
        "ok": True,
        "url": cdn_url,
        "name": original_name,
        "size": len(raw),
        "mime_type": mime_type,
    })
