/**
 * Returns a default value if the provided value is null or undefined.
 * Supports environment variables as a fallback.
 *
 * @param value The value to check for null or undefined.
 * @param defaultValue The default value to return if value is null or undefined.
 * @param envVarName The name of the environment variable to check as a fallback.
 * @returns The value if it's not null or undefined, otherwise the default value or the environment variable value.
 */
export const defaultIfNull = <T>(value: T | null | undefined, defaultValue: T, envVarName?: string): T => {
  // Check if an environment variable name is provided
  if (envVarName) {
    // Get the value of the environment variable
    const envValue = process.env[envVarName];
    // If the environment variable is set, return its value
    if (envValue !== undefined) {
      return envValue as T;
    }
  }
  // Check if the value is null or undefined
  if (value === null || value === undefined) {
    // Return the default value if the value is null or undefined
    return defaultValue;
  }
  // Return the original value if it's not null or undefined
  return value;
};

export const withDefault = <T>(value: T, defaultValue: T) => value || defaultValue;
