export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  provider: string;
  createdAt?: string;
}

export interface MeResponse {
  user: User | null;
  googleEnabled?: boolean;
  dbConfigured?: boolean;
  degraded?: boolean;
}

export interface ApiErrorBody {
  error?: { code?: string; message?: string };
}

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, code = "unknown", status = 0) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

// Empty on Vercel (same origin). Can be overridden if the API lives elsewhere.
const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? "";

export function apiUrl(path: string) {
  return `${API_BASE}${path}`;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(apiUrl(path), {
      credentials: "include",
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(init.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError("Le serveur est injoignable.", "network", 0);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    // Static hosts (GitHub Pages) answer with HTML for /api routes.
    throw new ApiError(
      "Le service de compte n'est pas disponible sur cette adresse.",
      "api_unavailable",
      response.status,
    );
  }

  const data = (await response.json().catch(() => ({}))) as T & ApiErrorBody;
  if (!response.ok) {
    throw new ApiError(
      data?.error?.message || "Une erreur est survenue.",
      data?.error?.code || "http_error",
      response.status,
    );
  }
  return data;
}

export function getMe() {
  return request<MeResponse>("/api/auth/me", { method: "GET" });
}

export function signupRequest(payload: {
  email: string;
  password: string;
  name?: string;
}) {
  return request<{ user: User }>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginRequest(payload: { email: string; password: string }) {
  return request<{ user: User }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function logoutRequest() {
  return request<{ ok: boolean }>("/api/auth/logout", { method: "POST" });
}

export function updateProfileRequest(payload: { name?: string | null; avatar?: string | null }) {
  return request<{ user: User }>("/api/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function getProgressRequest<T>() {
  return request<{ state: T | null; updatedAt: string | null }>("/api/progress", {
    method: "GET",
  });
}

export function putProgressRequest<T>(state: T) {
  return request<{ ok: boolean; updatedAt: string | null }>("/api/progress", {
    method: "PUT",
    body: JSON.stringify({ state }),
  });
}

export function googleStartUrl() {
  return apiUrl("/api/auth/google/start");
}
