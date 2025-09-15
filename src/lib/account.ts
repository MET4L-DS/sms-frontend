/**
 * Account management service for handling user profile operations
 * Provides functions to get current user profile and update user details
 */

import { handleApiError } from "./utils/error-handler";

const API_BASE_URL = "http://localhost/sms/api";

/**
 * User profile interface matching the API response structure from auth/me endpoint
 */
export interface UserProfile {
  user_id?: number;
  user_type: string;
  department_id?: number | null;
  full_name: string;
  email: string;
  is_active?: boolean;
}

/**
 * Update profile request interface
 */
export interface UpdateProfileRequest {
  full_name?: string;
  email?: string;
  current_password?: string;
  new_password?: string;
}

/**
 * Account service class for managing user profile operations
 */
export class AccountService {
  /**
   * Get current user profile from auth/me endpoint
   * @param token - JWT authentication token
   * @returns Promise resolving to user profile data
   */
  static async getUserProfile(token: string): Promise<UserProfile> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(await handleApiError(response));
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to fetch user profile");
    }
  }

  /**
   * Update current user profile via auth/me endpoint
   * @param token - JWT authentication token
   * @param updateData - Profile data to update
   * @returns Promise resolving to success message
   */
  static async updateUserProfile(
    token: string,
    updateData: UpdateProfileRequest
  ): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(await handleApiError(response));
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to update user profile");
    }
  }

  /**
   * Validate password strength
   * @param password - Password to validate
   * @returns Array of validation error messages (empty if valid)
   */
  static validatePassword(password: string): string[] {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }

    return errors;
  }

  /**
   * Check if password change is valid
   * @param currentPassword - Current password
   * @param newPassword - New password
   * @param confirmPassword - Password confirmation
   * @returns Array of validation error messages (empty if valid)
   */
  static validatePasswordChange(
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ): string[] {
    const errors: string[] = [];

    if (!currentPassword) {
      errors.push("Current password is required");
    }

    if (!newPassword) {
      errors.push("New password is required");
    }

    if (newPassword !== confirmPassword) {
      errors.push("New passwords do not match");
    }

    // Add password strength validation
    errors.push(...this.validatePassword(newPassword));

    return errors;
  }
}
