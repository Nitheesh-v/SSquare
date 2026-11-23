export type UserRole = "customer" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  company?: string;
}
