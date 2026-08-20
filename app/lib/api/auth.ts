// Typed client for the backend auth API (apps/suddh-bharat-backend, /auth/*).
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export type Role = 'USER' | 'VENDOR' | 'ADMIN' | 'SUPERADMIN';

export interface AuthUser {
  id: string;
  email: string | null;
  phone: string | null;
  name: string | null;
  roles: Role[];
  provider: 'LOCAL' | 'GOOGLE' | 'PHONE';
  emailVerified: boolean;
  phoneVerified: boolean;
}

export interface AuthResult {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  init: RequestInit & { auth?: string } = {},
): Promise<T> {
  const { auth, headers, ...rest } = init;
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
      ...headers,
    },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string | string[] };
    const msg = Array.isArray(body.message) ? body.message[0] : body.message;
    throw new ApiError(msg ?? 'Request failed', res.status);
  }
  return (await res.json()) as T;
}

const json = (body: unknown): RequestInit => ({
  method: 'POST',
  body: JSON.stringify(body),
});

export const authApi = {
  register: (b: { email: string; password: string; name?: string }) =>
    request<AuthResult>('/auth/register', json(b)),
  login: (b: { email: string; password: string }) =>
    request<AuthResult>('/auth/login', json(b)),
  requestOtp: (phone: string) =>
    request<{ phone: string; devCode?: string }>('/auth/otp/request', json({ phone })),
  verifyOtp: (phone: string, code: string) =>
    request<AuthResult>('/auth/otp/verify', json({ phone, code })),
  refresh: (refreshToken: string) =>
    request<AuthResult>('/auth/refresh', json({ refreshToken })),
  logout: (refreshToken: string) =>
    request<{ success: boolean }>('/auth/logout', json({ refreshToken })),
  me: (accessToken: string) => request<AuthUser>('/auth/me', { auth: accessToken }),
  updateProfile: (
    accessToken: string,
    input: { name?: string; phone?: string },
  ) =>
    request<AuthUser>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(input),
      auth: accessToken,
    }),
  googleUrl: () => `${API_URL}/auth/google`,
};
