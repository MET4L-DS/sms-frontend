const API_BASE_URL = "http://localhost/sms/api";
import { handleApiError } from "./utils/error-handler";

export interface Department {
  department_id: number;
  department_code: string;
  department_name: string;
  hod_name: string;
  hod_email: string;
}

export interface CreateDepartmentRequest {
  department_code: string;
  department_name: string;
  hod_email: string;
}

export interface CreateDepartmentResponse {
  message: string;
  department_id: number;
  department_code: string;
  department_name: string;
  hod_email: string;
}

export class DepartmentService {
  static async getAllDepartments(token: string): Promise<Department[]> {
    const response = await fetch(`${API_BASE_URL}/departments`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      await handleApiError(response, "Failed to fetch departments");
    }

    return response.json();
  }

  static async getDepartment(token: string, id: number): Promise<Department> {
    const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      await handleApiError(response, "Failed to fetch department");
    }

    return response.json();
  }

  static async createDepartment(
    token: string,
    data: CreateDepartmentRequest
  ): Promise<CreateDepartmentResponse> {
    const response = await fetch(`${API_BASE_URL}/departments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      await handleApiError(response, "Failed to create department");
    }

    return response.json();
  }

  static async updateDepartment(
    token: string,
    id: number,
    data: Partial<CreateDepartmentRequest>
  ): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      await handleApiError(response, "Failed to update department");
    }

    return response.json();
  }

  static async deleteDepartment(
    token: string,
    id: number
  ): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      await handleApiError(response, "Failed to delete department");
    }

    return response.json();
  }
}
