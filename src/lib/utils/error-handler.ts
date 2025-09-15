/**
 * Error handling utilities for API responses
 * Provides standardized error message extraction and handling across the application
 */

/**
 * Extracts user-friendly error message from various error sources
 * @param error - Error object, string, or unknown type from API/exception
 * @param fallbackMessage - Default message if error parsing fails
 * @returns Formatted error message string
 */
export function extractErrorMessage(
  error: unknown,
  fallbackMessage: string = "An error occurred"
): string {
  try {
    // If error is already a string, try to parse it as JSON
    if (typeof error === "string") {
      const parsedError = JSON.parse(error);
      return parsedError.error || parsedError.message || fallbackMessage;
    }

    // If error is an Error object
    if (error instanceof Error) {
      try {
        const parsedError = JSON.parse(error.message);
        return parsedError.error || parsedError.message || fallbackMessage;
      } catch {
        return error.message || fallbackMessage;
      }
    }

    // If error is an object with error or message property
    if (error && typeof error === "object") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorObj = error as any;
      return errorObj.error || errorObj.message || fallbackMessage;
    }

    return fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

/**
 * Handles API response errors and extracts meaningful error messages
 * Attempts multiple parsing strategies to get the best error message from backend
 * @param response - Fetch API response object
 * @param defaultErrorMessage - Default error message if parsing fails
 * @throws Error with properly formatted error message
 */
export async function handleApiError(
  response: Response,
  defaultErrorMessage: string = "API request failed"
): Promise<never> {
  let errorMessage = defaultErrorMessage;

  try {
    // Clone response to allow multiple parsing attempts
    const responseClone = response.clone();
    const errorData = await responseClone.json();
    errorMessage = errorData.error || errorData.message || defaultErrorMessage;
  } catch {
    // If JSON parsing fails, try reading as plain text
    try {
      const responseText = await response.text();
      if (responseText.trim()) {
        // Try to parse text as JSON one more time
        try {
          const parsedData = JSON.parse(responseText);
          errorMessage =
            parsedData.error || parsedData.message || defaultErrorMessage;
        } catch {
          // If it's not JSON, use the text content if meaningful
          errorMessage = responseText.trim();
        }
      } else {
        // No content, use HTTP status text
        errorMessage = response.statusText || defaultErrorMessage;
      }
    } catch {
      // Final fallback to HTTP status text
      errorMessage = response.statusText || defaultErrorMessage;
    }
  }

  // Throw error with standardized format
  throw new Error(JSON.stringify({ error: errorMessage }));
}
