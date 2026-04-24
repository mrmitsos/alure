import { create } from "zustand";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const getLocalStorage = (key: string): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
};

const useAuthStore = create<AuthStore>((set) => ({
  user: JSON.parse(getLocalStorage("user") || "null"),
  token: getLocalStorage("token"),

  login: (user, token) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },
}));

export default useAuthStore;
