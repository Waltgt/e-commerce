import { defineStore } from "pinia";
import { api } from "../lib/api";

interface User {
  userId: number;
  roleName: string;
}

function decodeToken(token: string): User {
  const payload = JSON.parse(atob(token.split(".")[1]));
  return { userId: payload.userId, roleName: payload.roleName };
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    accessToken: null as string | null,
    user: null as User | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    isAdmin: (state) => state.user?.roleName === "ADMIN",
  },

  actions: {
    setSession(accessToken: string) {
      this.accessToken = accessToken;
      this.user = decodeToken(accessToken);
    },

    clearSession() {
      this.accessToken = null;
      this.user = null;
    },

    async login(email: string, password: string) {
      const { data } = await api.post("/auth/login", { email, password });
      this.setSession(data.data.accessToken);
    },
    
    async register(name: string, email: string, password: string) {
      await api.post("/auth/register", { name, email, password });
    },

    async loginWithGoogle(idToken: string) {
      const { data } = await api.post("/auth/google", { idToken });
      this.setSession(data.data.accessToken);
    },

    async refresh() {
      const { data } = await api.post("/auth/refresh");
      this.setSession(data.data.accessToken);
    },

    async logout() {
      await api.post("/auth/logout");
      this.clearSession();
    },

    async requestPasswordReset(email: string) {
      await api.post("/auth/password-reset/request", { email });
    },

    async confirmPasswordReset(token: string, newPassword: string) {
      await api.post("/auth/password-reset/confirm", { token, newPassword });
    },

    // Intentar recuperar sesión al cargar la aplicación, usando la cookie de refresh existente
    async tryRestoreSession() {
      try {
        await this.refresh();
      } catch {
        this.clearSession();
      }
    },
  },
});