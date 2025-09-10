const API_BASE_URL = "http://localhost/sms/api";

export interface LoginResponse {
  token: string;
}

export interface UserProfile {
  user_type: "ADMIN" | "HOD" | "FACULTY" | "STAFF" | "STUDENT";
  email: string;
  full_name: string;
  department_id?: number;
}

export class AuthService {
  static async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Login failed" }));
      throw new Error(JSON.stringify(errorData));
    }

    return response.json();
  }

  static async getProfile(token: string): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get profile");
    }

    return response.json();
  }

  static setToken(token: string) {
    localStorage.setItem("auth_token", token);
  }

  static getToken(): string | null {
    return localStorage.getItem("auth_token");
  }

  static removeToken() {
    localStorage.removeItem("auth_token");
  }

  static logout() {
    this.removeToken();
    window.location.href = "/login";
  }
}
