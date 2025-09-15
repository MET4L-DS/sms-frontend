const API_BASE_URL = "http://localhost/sms/api";

export interface DegreeLevel {
  degree_level_id: number;
  level_name: string;
}

export interface CreateDegreeRequest {
  level_name: string;
}

export interface UpdateDegreeRequest {
  level_name?: string;
}

export class DegreeService {
  /**
   * Get all degree levels
   * Available to any authenticated user
   */
  static async getDegrees(): Promise<DegreeLevel[]> {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      console.log("Making request to:", `${API_BASE_URL}/degrees`);
      const response = await fetch(`${API_BASE_URL}/degrees`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = "Failed to fetch degrees";
        try {
          const errorData = await response.text();
          console.log("Error response:", errorData);

          // Try to parse as JSON
          try {
            const parsedError = JSON.parse(errorData);
            errorMessage =
              parsedError.error || parsedError.message || errorMessage;
          } catch {
            // If not JSON, use the text as is
            errorMessage = errorData || errorMessage;
          }
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Received data:", data);
      return data;
    } catch (error: any) {
      console.error("Error in getDegrees:", error);
      throw error;
    }
  }

  /**
   * Get specific degree level by ID
   * Available to any authenticated user
   */
  static async getDegree(id: number): Promise<DegreeLevel> {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/degrees/${id}`, {
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
   * Create new degree level
   * Admin only
   */
  static async createDegree(degreeData: CreateDegreeRequest): Promise<any> {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/degrees`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(degreeData),
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
   * Update existing degree level
   * Admin only
   */
  static async updateDegree(
    id: number,
    degreeData: UpdateDegreeRequest
  ): Promise<any> {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/degrees/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(degreeData),
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
   * Delete degree level
   * Admin only
   */
  static async deleteDegree(id: number): Promise<any> {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/degrees/${id}`, {
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
}
