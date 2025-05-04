/**
 * Storage utilities for MyOnCall
 * Handles localStorage and cookie operations
 */

// Storage keys
export const STORAGE_KEYS = {
  USER_DATA: "moc_users",
  AUTH_TOKEN: "moc_auth",
  HOLIDAYS: "moc_holidays",
  TEAM_MEMBERS: "moc_team_members",
  SCHEDULES: "moc_schedules",
  AVAILABILITY: "moc_availability",
  SETTINGS: "moc_settings",
};

/**
 * Get data from localStorage
 * @param {string} key - The storage key
 * @returns {any} - Parsed data or null if not found
 */
export const getLocalData = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error getting data for key "${key}":`, error);
    return null;
  }
};

/**
 * Set data in localStorage
 * @param {string} key - The storage key
 * @param {any} data - Data to store (will be JSON stringified)
 * @returns {boolean} - Success status
 */
export const setLocalData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error setting data for key "${key}":`, error);
    return false;
  }
};

/**
 * Remove data from localStorage
 * @param {string} key - The storage key to remove
 * @returns {boolean} - Success status
 */
export const removeLocalData = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing data for key "${key}":`, error);
    return false;
  }
};

/**
 * Clear all application data from localStorage
 */
export const clearAllData = () => {
  try {
    // Only clear our app's data, not all localStorage
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error("Error clearing all data:", error);
    return false;
  }
};

/**
 * Set a cookie
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} days - Days until expiration (default: 7)
 */
export const setCookie = (name, value, days = 7) => {
  try {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Strict`;
    return true;
  } catch (error) {
    console.error(`Error setting cookie "${name}":`, error);
    return false;
  }
};

/**
 * Get a cookie value
 * @param {string} name - Cookie name
 * @returns {string|null} - Cookie value or null if not found
 */
export const getCookie = (name) => {
  try {
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i];
      while (cookie.charAt(0) === " ") {
        cookie = cookie.substring(1);
      }
      if (cookie.indexOf(nameEQ) === 0) {
        return cookie.substring(nameEQ.length, cookie.length);
      }
    }
    return null;
  } catch (error) {
    console.error(`Error getting cookie "${name}":`, error);
    return null;
  }
};

/**
 * Remove a cookie
 * @param {string} name - Cookie name
 */
export const removeCookie = (name) => {
  try {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict`;
    return true;
  } catch (error) {
    console.error(`Error removing cookie "${name}":`, error);
    return false;
  }
};

/**
 * Check if localStorage is available
 * @returns {boolean} - Whether localStorage is available
 */
export const isStorageAvailable = () => {
  try {
    const test = "__storage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
    // eslint-disable-next-line no-unused-vars
  } catch (_) {
    return false;
  }
};

// Initialize check for storage availability
if (!isStorageAvailable()) {
  console.error("Local storage is not available. The application may not function correctly.");
}
