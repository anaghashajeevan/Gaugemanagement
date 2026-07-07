const BASE_URL = 'http://localhost:8000/api';

// ═════════════════════════════════════════════════════════════════════════════
// TOKEN MANAGEMENT
// ═════════════════════════════════════════════════════════════════════════════

export const tokenStorage = {
  get:        ()           => localStorage.getItem('gauge_token'),
  set:        (t: string)  => localStorage.setItem('gauge_token', t),
  refresh:    ()           => localStorage.getItem('gauge_refresh'),
  setRefresh: (t: string)  => localStorage.setItem('gauge_refresh', t),
  getUser:    ()           => {
    const u = localStorage.getItem('gauge_user');
    return u ? JSON.parse(u) : null;
  },
  setUser:    (u: UserProfile) => localStorage.setItem('gauge_user', JSON.stringify(u)),
  clear:      ()           => {
    localStorage.removeItem('gauge_token');
    localStorage.removeItem('gauge_refresh');
    localStorage.removeItem('gauge_user');
  },
};

// ═════════════════════════════════════════════════════════════════════════════
// BASE FETCH WRAPPER
// ═════════════════════════════════════════════════════════════════════════════

export async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  skipAuth = false
): Promise<T> {
  const token = tokenStorage.get();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (!skipAuth && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(
    `${BASE_URL}${endpoint}`,
    { ...options, headers }
  );

  if (res.status === 401 && !skipAuth) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${tokenStorage.get()}`;
      const retryRes = await fetch(
        `${BASE_URL}${endpoint}`,
        { ...options, headers }
      );
      if (!retryRes.ok) throw new Error(await retryRes.text());
      return retryRes.json();
    }
    tokenStorage.clear();
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({
      detail: res.statusText,
    }));
    throw new Error(body.error || body.detail || 'Request failed');
  }

  if (res.status === 204) return {} as T;
  return res.json();
}

async function tryRefresh(): Promise<boolean> {
  const refresh = tokenStorage.refresh();
  if (!refresh) return false;
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh/`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ refresh }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    tokenStorage.set(data.access);
    if (data.refresh) {
      tokenStorage.setRefresh(data.refresh);
    }
    return true;
  } catch {
    return false;
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// AUTH
// ═════════════════════════════════════════════════════════════════════════════

export const authAPI = {
  login: (email: string, password: string) =>
    request<LoginResponse>('/auth/login/', {
      method: 'POST',
      body:   JSON.stringify({ email, password }),
    }, true),

  logout: () =>
    request('/auth/logout/', {
      method: 'POST',
    }),

  me: () => request<UserProfile>('/auth/me/'),

  changePassword: (
    currentPassword: string,
    newPassword:     string,
    confirmPassword: string
  ) =>
    request('/auth/change-password/', {
      method: 'POST',
      body:   JSON.stringify({
        current_password: currentPassword,
        new_password:     newPassword,
        confirm_password: confirmPassword,
      }),
    }),
};

// ═════════════════════════════════════════════════════════════════════════════
// USERS
// ═════════════════════════════════════════════════════════════════════════════

export const usersAPI = {
  list: (params?: Record<string, string>) => {
    const qs = params
      ? '?' + new URLSearchParams(params).toString()
      : '';
    return request<GaugeUser[]>(`/users/${qs}`);
  },

  detail: (id: number) =>
    request<GaugeUser>(`/users/${id}/`),

  create: (data: CreateUserPayload) =>
    request<GaugeUser>('/users/', {
      method: 'POST',
      body:   JSON.stringify(data),
    }),

  update: (id: number, data: Partial<UpdateUserPayload>) =>
    request<GaugeUser>(`/users/${id}/`, {
      method: 'PATCH',
      body:   JSON.stringify(data),
    }),

  deactivate: (id: number) =>
    request<void>(`/users/${id}/`, { method: 'DELETE' }),

  resetPassword: (id: number, newPassword: string) =>
    request<{ detail: string }>(
      `/users/${id}/reset_password/`,
      {
        method: 'POST',
        body:   JSON.stringify({ new_password: newPassword }),
      }
    ),
};

// ═════════════════════════════════════════════════════════════════════════════
// ROLES
// ═════════════════════════════════════════════════════════════════════════════

export const rolesAPI = {
  list: () =>
    request<RoleType[]>('/roles/'),

  detail: (id: number) =>
    request<RoleType>(`/roles/${id}/`),

  create: (data: Partial<RoleType>) =>
    request<RoleType>('/roles/', {
      method: 'POST',
      body:   JSON.stringify(data),
    }),

  update: (id: number, data: Partial<RoleType>) =>
    request<RoleType>(`/roles/${id}/`, {
      method: 'PATCH',
      body:   JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<void>(`/roles/${id}/`, {
      method: 'DELETE',
    }),
};

// ═════════════════════════════════════════════════════════════════════════════
// DEPARTMENTS
// ═════════════════════════════════════════════════════════════════════════════

export const departmentsAPI = {
  list: () =>
    request<DepartmentType[]>('/departments/'),

  detail: (id: number) =>
    request<DepartmentType>(`/departments/${id}/`),

  create: (data: Partial<DepartmentType>) =>
    request<DepartmentType>('/departments/', {
      method: 'POST',
      body:   JSON.stringify(data),
    }),

  update: (id: number, data: Partial<DepartmentType>) =>
    request<DepartmentType>(`/departments/${id}/`, {
      method: 'PATCH',
      body:   JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<void>(`/departments/${id}/`, {
      method: 'DELETE',
    }),
};

// ═════════════════════════════════════════════════════════════════════════════
// AUDIT LOGS
// ═════════════════════════════════════════════════════════════════════════════

export const auditAPI = {
  list: (params?: Record<string, string>) => {
    const qs = params
      ? '?' + new URLSearchParams(params).toString()
      : '';
    return request<AuditLogType[]>(`/audit-logs/${qs}`);
  },

  detail: (id: number) =>
    request<AuditLogType>(`/audit-logs/${id}/`),
};
export const operatorsAPI = {
  /** Get all users who can be MSA operators (active users with relevant roles) */
  list: async (): Promise<GaugeUser[]> => {
    const allUsers = await usersAPI.list();
    const users = Array.isArray(allUsers)
      ? allUsers
      : (allUsers as any)?.results || [];
    // Return users with operator or quality_engineer roles (anyone who can take measurements)
    return users.filter(
      (u: GaugeUser) =>
        u.is_active &&
        (u.role_code === 'shop_floor_operator' ||
         u.role_code === 'quality_engineer' ||
         u.role_code === 'store_keeper')
    );
  },
};
// ═════════════════════════════════════════════════════════════════════════════
// PLACEHOLDER: FUTURE MODULES (Gauge, Calibration, MSA, CAPA)
// ═════════════════════════════════════════════════════════════════════════════

// export const gaugesAPI = { ... };
// export const calibrationAPI = { ... };
// export const msaAPI = { ... };
// export const capaAPI = { ... };
// export const dashboardAPI = { ... };


// ═════════════════════════════════════════════════════════════════════════════
// TYPES
// ═════════════════════════════════════════════════════════════════════════════

// ── Auth ──────────────────────────────────────────────────────────────────

export interface LoginResponse {
  access:  string;
  refresh: string;
  user: {
    id:                    number;
    email:                 string;
    full_name:             string;
    role:                  string | null;       // role code, e.g. 'admin'
    role_name:             string | null;       // display name
    department:            string | null;
    must_change_password:  boolean;
  };
}

export interface UserProfile {
  id:                    number;
  email:                 string;
  full_name:             string;
  phone:                 string | null;
  role:                  number | null;         // role ID
  role_name:             string | null;
  role_code:             string | null;
  department:            number | null;         // dept ID
  department_name:       string | null;
  is_active:             boolean;
  must_change_password:  boolean;
  last_login:            string | null;
  created_at:            string;
}

// ── Users ─────────────────────────────────────────────────────────────────

export interface GaugeUser {
  id:                    number;
  email:                 string;
  full_name:             string;
  phone:                 string | null;
  role:                  number | null;
  role_name:             string | null;
  role_code:             string | null;
  department:            number | null;
  department_name:       string | null;
  is_active:             boolean;
  must_change_password:  boolean;
  last_login:            string | null;
  created_at:            string;
}

export interface CreateUserPayload {
  email:       string;
  full_name:   string;
  phone?:      string;
  role:        number;
  department?: number;
  password:    string;
}

export interface UpdateUserPayload {
  email:       string;
  full_name:   string;
  phone:       string;
  role:        number;
  department:  number | null;
  is_active:   boolean;
}

// ── Roles ─────────────────────────────────────────────────────────────────

export interface RoleType {
  id:          number;
  name:        string;
  code:        string;
  description: string;
  level:       number;
  is_active:   boolean;
  created_at:  string;
}

// ── Departments ───────────────────────────────────────────────────────────

export type DepartmentLocationType = 'store' | 'gauge_room' | 'shop_floor' | 'other';

export interface DepartmentType {
  id:            number;
  name:          string;
  location_type: DepartmentLocationType;
  is_active:     boolean;
  created_at:    string;
}

// ── Audit Logs ────────────────────────────────────────────────────────────

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'LOGIN_FAILED'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE';

export interface AuditLogType {
  id:          number;
  timestamp:   string;
  user_name:   string | null;
  action:      AuditAction;
  module:      string;
  record_id:   string | null;
  description: string | null;
  ip_address:  string | null;
}