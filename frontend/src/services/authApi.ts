import { api } from "./api";

export interface RegisterDto {
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export const authApi = {
  async register(data: RegisterDto) {
    const response = await api.post("/auth/register", data);

    return response.data;
  },

  async login(data: LoginDto) {
    const response = await api.post("/auth/login", data);

    return response.data;
  },

  async logout() {
    const response = await api.post("/auth/logout");
    return response.data;
  },
};