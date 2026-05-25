import { useState, useEffect, useCallback } from "react";

const AUTH_URL = "https://functions.poehali.dev/857f34d4-2daa-4be3-ad3f-52d27fe7d9b1";
const TOKEN_KEY = "ff_session_token";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  avatar_url: string;
  yandex_id: string;
}

export function useYandexAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async (token: string): Promise<AuthUser | null> => {
    try {
      const res = await fetch(`${AUTH_URL}?action=me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      const data = await res.json();
      return typeof data === "string" ? JSON.parse(data) : data;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    fetchMe(token).then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, [fetchMe]);

  // После редиректа от Яндекса — обмениваем code на токен
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (!code) return;

    // Убираем code из URL
    window.history.replaceState({}, document.title, window.location.pathname);

    const redirectUri = `${window.location.origin}${window.location.pathname}`;
    fetch(AUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, redirect_uri: redirectUri }),
    })
      .then((r) => r.json())
      .then((data) => {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        if (parsed.token && parsed.user) {
          localStorage.setItem(TOKEN_KEY, parsed.token);
          setUser(parsed.user);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async () => {
    // Получаем client_id с бэкенда чтобы не хранить в коде
    let clientId = "";
    try {
      const res = await fetch(`${AUTH_URL}?action=client_id`);
      const data = await res.json();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      clientId = parsed.client_id || "";
    } catch {
      clientId = "";
    }
    if (!clientId) {
      alert("Яндекс OAuth не настроен. Добавьте YANDEX_CLIENT_ID в секреты проекта.");
      return;
    }
    const redirectUri = encodeURIComponent(`${window.location.origin}${window.location.pathname}`);
    window.location.href = `https://oauth.yandex.ru/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
  }, []);

  const logout = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      await fetch(AUTH_URL, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
      localStorage.removeItem(TOKEN_KEY);
    }
    setUser(null);
  }, []);

  return { user, loading, login, logout };
}