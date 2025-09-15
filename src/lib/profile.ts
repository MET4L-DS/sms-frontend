/**
 * Profile management service for different user types
 * Handles student profiles, faculty profiles, and address management
 */

import { handleApiError } from "./utils/error-handler";

const API_BASE_URL = "http://localhost/sms/api";

// ===== INTERFACES =====

/**
 * Student profile interface based on API documentation
 */
export interface StudentProfile {
  user_id: number;
  is_part_time?: boolean;
  roll_number?: string;
  date_of_birth?: string;
  self_phone_number?: string;
  guardian_phone_number?: string;
  is_approved_admission?: boolean;
  batch_id?: number;
  department_id?: number;
  current_address_id?: number;
  permanent_address_id?: number;
  // Extended info from joins
  full_name?: string;
  email?: string;
  is_active?: boolean;
  department_name?: string;
  department_code?: string;
  batch_name?: string;
  programme_name?: string;
  level_name?: string;
}

/**
 * Faculty profile interface based on API documentation
 */
export interface FacultyProfile {
  user_id: number;
  phone_number?: string;
  specialization?: string;
  department_id?: number;
  // Extended info from joins
  full_name?: string;
  email?: string;
  is_active?: boolean;
  department_name?: string;
  department_code?: string;
}

/**
 * Address interface for student address management
 */
export interface Address {
  address_id?: number;
  user_id: number;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

/**
 * Degree level interface
 */
export interface DegreeLevel {
  degree_level_id: number;
  level_name: string;
}

/**
 * Programme interface
 */
export interface Programme {
  programme_id: number;
  programme_name: string;
  minimum_duration_years: number;
  maximum_duration_years: number;
  is_active: boolean;
  degree_level?: string;
  department_code?: string;
}

/**
 * Batch interface
 */
export interface Batch {
  batch_id: number;
  batch_name: string;
  start_year: number;
  start_semester: string;
  is_active: boolean;
  programme_name?: string;
  department_code?: string;
}

/**
 * Department interface
 */
export interface Department {
  department_id: number;
  department_code: string;
  department_name: string;
  hod_name?: string;
  hod_email?: string;
}

// ===== PROFILE MANAGEMENT SERVICE =====

export class ProfileService {
  /**
   * Get student profile by user ID
   */
  static async getStudentProfile(
    token: string,
    userId?: number
  ): Promise<StudentProfile> {
    try {
      const url = userId
        ? `${API_BASE_URL}/student-profiles/${userId}`
        : `${API_BASE_URL}/student-profiles/me`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(await handleApiError(response));
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to fetch student profile");
    }
  }

  /**
   * Create or update student profile
   */
  static async updateStudentProfile(
    token: string,
    userId: number,
    profileData: Partial<StudentProfile>
  ): Promise<{ message: string }> {
    try {
      // First try to get existing profile to determine if we need POST or PUT
      let isUpdate = true;
      try {
        await this.getStudentProfile(token, userId);
      } catch {
        isUpdate = false; // Profile doesn't exist, need to create
      }

      const method = isUpdate ? "PUT" : "POST";
      const url = isUpdate
        ? `${API_BASE_URL}/student-profiles/${userId}`
        : `${API_BASE_URL}/student-profiles`;

      const body = isUpdate ? profileData : { user_id: userId, ...profileData };

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(await handleApiError(response));
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to update student profile");
    }
  }

  /**
   * Get faculty profile by user ID
   */
  static async getFacultyProfile(
    token: string,
    userId?: number
  ): Promise<FacultyProfile> {
    try {
      const url = userId
        ? `${API_BASE_URL}/faculty-profiles/${userId}`
        : `${API_BASE_URL}/faculty-profiles/me`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(await handleApiError(response));
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to fetch faculty profile");
    }
  }

  /**
   * Create or update faculty profile
   */
  static async updateFacultyProfile(
    token: string,
    userId: number,
    profileData: Partial<FacultyProfile>
  ): Promise<{ message: string }> {
    try {
      // First try to get existing profile to determine if we need POST or PUT
      let isUpdate = true;
      try {
        await this.getFacultyProfile(token, userId);
      } catch {
        isUpdate = false; // Profile doesn't exist, need to create
      }

      const method = isUpdate ? "PUT" : "POST";
      const url = isUpdate
        ? `${API_BASE_URL}/faculty-profiles/${userId}`
        : `${API_BASE_URL}/faculty-profiles`;

      const body = isUpdate ? profileData : { user_id: userId, ...profileData };

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(await handleApiError(response));
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to update faculty profile");
    }
  }

  /**
   * Get user addresses
   */
  static async getAddresses(
    token: string,
    userId?: number
  ): Promise<Address[]> {
    try {
      const url = userId
        ? `${API_BASE_URL}/addresses?user_id=${userId}`
        : `${API_BASE_URL}/addresses`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(await handleApiError(response));
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to fetch addresses");
    }
  }

  /**
   * Create new address
   */
  static async createAddress(
    token: string,
    addressData: Omit<Address, "address_id">
  ): Promise<{ message: string; address_id: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/addresses`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addressData),
      });

      if (!response.ok) {
        throw new Error(await handleApiError(response));
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to create address");
    }
  }

  /**
   * Update address
   */
  static async updateAddress(
    token: string,
    addressId: number,
    addressData: Partial<Address>
  ): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/addresses/${addressId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addressData),
      });

      if (!response.ok) {
        throw new Error(await handleApiError(response));
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to update address");
    }
  }

  /**
   * Assign address as current or permanent
   */
  static async assignAddressType(
    token: string,
    addressId: number,
    type: "current" | "permanent"
  ): Promise<{ message: string }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/addresses/${addressId}/assign`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ type }),
        }
      );

      if (!response.ok) {
        throw new Error(await handleApiError(response));
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to assign address type");
    }
  }

  /**
   * Delete address
   */
  static async deleteAddress(
    token: string,
    addressId: number
  ): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/addresses/${addressId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(await handleApiError(response));
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to delete address");
    }
  }

  // ===== SUPPORTING DATA SERVICES =====

  /**
   * Get all departments
   */
  static async getDepartments(token: string): Promise<Department[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/departments`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(await handleApiError(response));
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to fetch departments");
    }
  }

  /**
   * Get all programmes
   */
  static async getProgrammes(token: string): Promise<Programme[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/programmes`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(await handleApiError(response));
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to fetch programmes");
    }
  }

  /**
   * Get all batches
   */
  static async getBatches(token: string): Promise<Batch[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/batches`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(await handleApiError(response));
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to fetch batches");
    }
  }

  /**
   * Get all degree levels
   */
  static async getDegreeLevels(token: string): Promise<DegreeLevel[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/degrees`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(await handleApiError(response));
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to fetch degree levels");
    }
  }
}
