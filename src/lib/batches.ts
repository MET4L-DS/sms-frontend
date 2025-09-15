const API_BASE_URL = "http://localhost/sms/api";

export interface Batch {
  batch_id: number;
  batch_name: string;
  start_year: number;
  start_semester: "SPRING" | "AUTUMN";
  is_active: boolean;
  programme_name: string;
  programme_id: number;
  department_code: string;
  department_name: string;
}

export interface CreateBatchRequest {
  programme_id: number;
  batch_name: string;
  start_year: number;
  start_semester: "SPRING" | "AUTUMN";
}

export interface UpdateBatchRequest {
  batch_name?: string;
  start_year?: number;
  start_semester?: "SPRING" | "AUTUMN";
  is_active?: boolean;
}

export class BatchService {
  /**
   * Get all batches in your department
   * Available to any authenticated user from department
   */
  static async getBatches(): Promise<Batch[]> {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/batches`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMessage = "Failed to fetch batches";
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
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Get specific batch details from your department
   * Available to any authenticated user from department
   */
  static async getBatch(id: number): Promise<Batch> {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/batches/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMessage = "Failed to fetch batch";
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
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Create a new batch in your department
   * HOD or STAFF only
   */
  static async createBatch(batchData: CreateBatchRequest): Promise<any> {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/batches`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(batchData),
      });

      if (!response.ok) {
        let errorMessage = "Failed to create batch";
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
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Update batch in your department
   * HOD or STAFF only
   */
  static async updateBatch(
    id: number,
    batchData: UpdateBatchRequest
  ): Promise<any> {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/batches/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(batchData),
      });

      if (!response.ok) {
        let errorMessage = "Failed to update batch";
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
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Delete batch from your department
   * HOD only
   */
  static async deleteBatch(id: number): Promise<any> {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/batches/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMessage = "Failed to delete batch";
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
    } catch (error: any) {
      throw error;
    }
  }
}
