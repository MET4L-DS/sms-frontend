const API_BASE_URL = "http://localhost/sms/api";

// Faculty interface definitions
export interface Faculty {
  user_id: number;
  user_type: string;
  full_name: string;
  email: string;
  is_active: boolean;
  phone_number?: string;
  specialization?: string;
  department_code: string;
  department_name: string;
}

export interface CreateFacultyRequest {
  email: string;
}

export interface UpdateFacultyRequest {
  full_name?: string;
  email?: string;
  phone_number?: string;
  specialization?: string;
  is_active?: boolean;
}

export interface FacultyProfileUpdateRequest {
  phone_number?: string;
  specialization?: string;
}

export class FacultyService {
  private static getAuthHeaders() {
    const token = localStorage.getItem("auth_token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If JSON parsing fails, use default error message
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  }

  static async getFaculties(): Promise<Faculty[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/faculties`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<Faculty[]>(response);
    } catch (error) {
      console.error("Error fetching faculties:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to fetch faculties"
      );
    }
  }

  static async getFaculty(id: number): Promise<Faculty> {
    try {
      const response = await fetch(`${API_BASE_URL}/faculties/${id}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<Faculty>(response);
    } catch (error) {
      console.error("Error fetching faculty:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to fetch faculty details"
      );
    }
  }

  static async createFaculty(
    faculty: CreateFacultyRequest
  ): Promise<{
    message: string;
    user_id: number;
    user_type: string;
    email: string;
    department_id: number;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/faculties`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(faculty),
      });

      return this.handleResponse<{
        message: string;
        user_id: number;
        user_type: string;
        email: string;
        department_id: number;
      }>(response);
    } catch (error) {
      console.error("Error creating faculty:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to create faculty"
      );
    }
  }

  static async updateFaculty(
    id: number,
    faculty: UpdateFacultyRequest
  ): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/faculties/${id}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(faculty),
      });

      return this.handleResponse<{ message: string }>(response);
    } catch (error) {
      console.error("Error updating faculty:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to update faculty"
      );
    }
  }

  static async updateFacultyProfile(
    id: number,
    profileData: FacultyProfileUpdateRequest
  ): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/faculties/${id}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(profileData),
      });

      return this.handleResponse<{ message: string }>(response);
    } catch (error) {
      console.error("Error updating faculty profile:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    }
  }

  static async deleteFaculty(
    id: number
  ): Promise<{
    message: string;
    deleted_faculty: { full_name: string; email: string };
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/faculties/${id}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<{
        message: string;
        deleted_faculty: { full_name: string; email: string };
      }>(response);
    } catch (error) {
      console.error("Error deleting faculty:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to delete faculty"
      );
    }
  }
}
