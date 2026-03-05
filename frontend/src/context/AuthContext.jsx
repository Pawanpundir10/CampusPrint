import { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = localStorage.getItem("cp_user");
    const t = localStorage.getItem("cp_token");
    if (u && t) setUser(JSON.parse(u));
    setLoading(false);
  }, []);

  const save = (token, user) => {
    localStorage.setItem("cp_token", token);
    localStorage.setItem("cp_user", JSON.stringify(user));
    setUser(user);
  };

  const login = async (e, p) => {
    const { data } = await API.post("/auth/login", { email: e, password: p });
    save(data.token, data.user);
    return data.user;
  };

  // Registration only creates account + sends verification email.
  // We DO NOT auto-login; user must verify and then sign in.
  const register = async (f) => {
    const { data } = await API.post("/auth/register", f);
    return data;
  };
  const logout = () => { localStorage.removeItem("cp_token"); localStorage.removeItem("cp_user"); setUser(null); };
  const updateUser = (u) => { const n = { ...user, ...u }; localStorage.setItem("cp_user", JSON.stringify(n)); setUser(n); };

  return <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
