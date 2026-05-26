const FORMS_URL = "https://functions.poehali.dev/64ba70e7-2376-416b-9dff-265e6a77cd03";
const RESPONSES_URL = "https://functions.poehali.dev/0c74e3f4-01ab-421c-9583-ab61ddd23057";
const UPLOAD_URL = "https://functions.poehali.dev/a138996c-aec7-415b-b866-bc493c3a6a8d";

function getToken(): string {
  return localStorage.getItem("ff_session_token") || "";
}

function authHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "X-Authorization": `Bearer ${getToken()}`,
  };
}

async function parseJson(res: Response) {
  const text = await res.text();
  try {
    const parsed = JSON.parse(text);
    return typeof parsed === "string" ? JSON.parse(parsed) : parsed;
  } catch {
    return {};
  }
}

// ─── Forms ───────────────────────────────────────────────

export interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export interface Form {
  id: string;
  title: string;
  description: string;
  status: "draft" | "active" | "paused";
  slug: string;
  fields?: FormField[];
  settings?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  response_count: number;
}

export const formsApi = {
  async list(): Promise<Form[]> {
    const res = await fetch(FORMS_URL, { headers: authHeaders() });
    const data = await parseJson(res);
    return data.forms || [];
  },

  async create(payload: { title: string; description?: string; fields?: FormField[] }): Promise<Form> {
    const res = await fetch(FORMS_URL, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return parseJson(res);
  },

  async update(payload: Partial<Form> & { id: string }): Promise<Form> {
    const res = await fetch(FORMS_URL, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return parseJson(res);
  },

  async delete(id: string): Promise<void> {
    await fetch(`${FORMS_URL}?id=${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
  },

  async getBySlug(slug: string): Promise<Form | null> {
    const res = await fetch(`${FORMS_URL}?slug=${slug}`);
    if (!res.ok) return null;
    return parseJson(res);
  },

  publicUrl(slug: string): string {
    return `${window.location.origin}/form/${slug}`;
  },
};

// ─── Responses ───────────────────────────────────────────

export interface FormResponse {
  id: string;
  data: Record<string, string>;
  name: string;
  email: string;
  created_at: string;
}

export const responsesApi = {
  async list(formId: string): Promise<FormResponse[]> {
    const res = await fetch(`${RESPONSES_URL}?form_id=${formId}`, { headers: authHeaders() });
    const data = await parseJson(res);
    return data.responses || [];
  },

  async submit(formId: string, data: Record<string, string>, name?: string, email?: string): Promise<{ ok: boolean }> {
    const res = await fetch(RESPONSES_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ form_id: formId, data, name: name || "", email: email || "" }),
    });
    return parseJson(res);
  },

  async delete(id: string): Promise<void> {
    await fetch(`${RESPONSES_URL}?id=${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
  },
};

// ─── Upload ───────────────────────────────────────────────

export interface UploadResult {
  ok: boolean;
  url: string;
  name: string;
  size: number;
  mime_type: string;
}

export const uploadApi = {
  async uploadFile(file: File): Promise<UploadResult> {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const res = await fetch(UPLOAD_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        file: base64,
        mime_type: file.type || "application/octet-stream",
        name: file.name,
      }),
    });
    return parseJson(res);
  },
};