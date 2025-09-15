const API_BASE_URL = "http://localhost/sms/api";

export interface Programme {
  programme_id: number;
  programme_name: string;
  minimum_duration_years: number;
  maximum_duration_years: number;
  is_active: boolean;
  degree_level: string;
  department_code: string;
  department_name: string;
}

export interface CreateProgrammeRequest {
  programme_name: string;
  degree_level_id: number;
  minimum_duration_years: number;
  maximum_duration_years: number;
}

export interface UpdateProgrammeRequest {
  programme_name?: string;
  minimum_duration_years?: number;
  maximum_duration_years?: number;
  is_active?: boolean;
}

export class ProgrammeService {
  /**
   * Get all programmes in your department
   * Available to any authenticated user from department
   */
  static async getProgrammes(): Promise<Programme[]> {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/programmes`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMessage = "Failed to fetch programmes";
        try {
          const errorData = await response.text();
          try {
            const parsedError = JSON.parse(errorData);
            errorMessage =
              parsedError.error || parsedError.message || errorMessage;
          } catch {
            errorMessage = errorData || errorMessage;
          }
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error: unknown) {
      throw error;
    }
  }

  /**
   * Get specific programme details from your department
   * Available to any authenticated user from department
   */
  static async getProgramme(id: number): Promise<Programme> {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/programmes/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMessage = "Failed to fetch programme";
        try {
          const errorData = await response.text();
          try {
            const parsedError = JSON.parse(errorData);
            errorMessage =
              parsedError.error || parsedError.message || errorMessage;
          } catch {
            errorMessage = errorData || errorMessage;
          }
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error: unknown) {
      throw error;
    }
  }

  /**
   * Create a new programme in your department
   * HOD only
   */
  static async createProgramme(
    programmeData: CreateProgrammeRequest
  ): Promise<Programme> {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/programmes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(programmeData),
      });

      if (!response.ok) {
        let errorMessage = "Failed to create programme";
        try {
          const errorData = await response.text();
          try {
            const parsedError = JSON.parse(errorData);
            errorMessage =
              parsedError.error || parsedError.message || errorMessage;
          } catch {
            errorMessage = errorData || errorMessage;
          }
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error: unknown) {
      throw error;
    }
  }

  /**
   * Update programme in your department
   * HOD only
   */
  static async updateProgramme(
    id: number,
    programmeData: UpdateProgrammeRequest
  ): Promise<Programme> {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/programmes/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(programmeData),
      });

      if (!response.ok) {
        let errorMessage = "Failed to update programme";
        try {
          const errorData = await response.text();
          try {
            const parsedError = JSON.parse(errorData);
            errorMessage =
              parsedError.error || parsedError.message || errorMessage;
          } catch {
            errorMessage = errorData || errorMessage;
          }
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error: unknown) {
      throw error;
    }
  }

  /**
   * Delete programme from your department
   * HOD only
   */
  static async deleteProgramme(id: number): Promise<void> {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/programmes/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMessage = "Failed to delete programme";
        try {
          const errorData = await response.text();
          try {
            const parsedError = JSON.parse(errorData);
            errorMessage =
              parsedError.error || parsedError.message || errorMessage;
          } catch {
            errorMessage = errorData || errorMessage;
          }
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error: unknown) {
      throw error;
    }
  }
}
