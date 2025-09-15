const API_BASE_URL = "http://localhost/sms/api";

export interface User {
  user_id: number;
  user_type: "STUDENT" | "FACULTY" | "STAFF" | "HOD" | "ADMIN";
  full_name: string;
  email: string;
  is_active: boolean;
  department_id?: number;
  department_name?: string;
  department_code?: string;
}

export type UserType = "STUDENT" | "FACULTY" | "STAFF" | "HOD" | "ADMIN";

export class UserService {
  /**
   * Get users filtered by type
   * Admin can view all, others can view department users
   */
  static async getUsers(type?: UserType): Promise<User[]> {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      let url = `${API_BASE_URL}/users`;
      if (type) {
        url += `?type=${type}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Get HOD users specifically
   * Admin can view all, others can view department HODs
   */
  static async getHODs(): Promise<User[]> {
    return this.getUsers("HOD");
  }

  /**
   * Get specific user by ID
   * Admin can view any user, others can view department users
   */
  static async getUser(id: number): Promise<User> {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Delete user
   * Admin can delete any user, HOD can delete department users
   */
  static async deleteUser(id: number): Promise<any> {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Get all available user types for filtering
   */
  static getUserTypes(): UserType[] {
    return ["ADMIN", "HOD", "FACULTY", "STAFF", "STUDENT"];
  }
}
