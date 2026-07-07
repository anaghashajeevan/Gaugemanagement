import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authAPI, tokenStorage, type UserProfile } from '../../src/api/api';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = tokenStorage.get();
    const savedUser = tokenStorage.getUser();

    if (token && savedUser) {
      setUser(savedUser);
      // Refresh user info from server in the background
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authAPI.login(email, password);
    tokenStorage.set(res.access);
    tokenStorage.setRefresh(res.refresh);

    // Build UserProfile from login response
    const profile: UserProfile = {
      id: res.user.id,
      email: res.user.email,
      full_name: res.user.full_name,
      phone: null,
      role: null,
      role_name: res.user.role_name,
      role_code: res.user.role,
      department: null,
      department_name: res.user.department,
      is_active: true,
      must_change_password: res.user.must_change_password,
      last_login: null,
      created_at: '',
    };

    tokenStorage.setUser(profile);
    setUser(profile);
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // Ignore errors on logout
    }
    tokenStorage.clear();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const profile = await authAPI.me();
      setUser(profile);
      tokenStorage.setUser(profile);
    } catch {
      // Ignore
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};