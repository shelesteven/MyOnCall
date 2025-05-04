/**
 * Authentication utilities for MyOnCall
 * Handles user authentication, registration, and session management
 */

import { getLocalData, setLocalData, removeLocalData, setCookie, getCookie, removeCookie, STORAGE_KEYS } from "./storage";

// Authentication constants
const TOKEN_EXPIRY_DAYS = 7;
const AUTH_COOKIE = "moc_auth_token";
const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
};

/**
 * Get the current user session
 * @returns {Object|null} - User session data or null if not authenticated
 */
export const getCurrentUser = () => {
  try {
    const authToken = getCookie(AUTH_COOKIE);

    if (!authToken) {
      return null;
    }

    // Get auth data from localStorage
    const authData = getLocalData(STORAGE_KEYS.AUTH_TOKEN);

    if (!authData || authData.token !== authToken) {
      return null;
    }

    // Check if token has expired
    const tokenExpiry = new Date(authData.expiresAt);
    if (tokenExpiry < new Date()) {
      // Token expired, clear auth data
      signOut();
      return null;
    }

    return authData.user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

/**
 * Check if the current user is authenticated
 * @returns {boolean} - Authentication status
 */
export const isAuthenticated = () => {
  return getCurrentUser() !== null;
};

/**
 * Check if the current user is an admin
 * @returns {boolean} - Admin status
 */
export const isAdmin = () => {
  const currentUser = getCurrentUser();
  return currentUser && currentUser.role === USER_ROLES.ADMIN;
};

/**
 * Create a new user
 * @param {Object} userData - User data
 * @param {boolean} isAdminUser - Whether to create an admin user
 * @returns {Object} - Created user data
 */
export const createUser = async (userData, isAdminUser = false) => {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Get existing users
    const users = getLocalData(STORAGE_KEYS.USER_DATA) || [];

    // Check if user with this email already exists
    const existingUser = users.find((user) => user.email === userData.email);
    if (existingUser) {
      throw new Error("A user with this email already exists");
    }

    // Create new user
    const newUser = {
      id: users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1,
      name: userData.name,
      email: userData.email.toLowerCase(),
      password: userData.password, // In a real app, this would be hashed
      role: isAdminUser ? USER_ROLES.ADMIN : USER_ROLES.USER,
      organizationName: userData.organizationName || null,
      createdAt: new Date().toISOString(),
    };

    // Add user to storage
    users.push(newUser);
    setLocalData(STORAGE_KEYS.USER_DATA, users);

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

/**
 * Sign in a user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object} - User data and authentication token
 */
export const signIn = async (email, password) => {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Get users
    const users = getLocalData(STORAGE_KEYS.USER_DATA) || [];

    // Find user with matching email
    const user = users.find((user) => user.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Check password
    if (user.password !== password) {
      // In a real app, this would use proper password verification
      throw new Error("Invalid email or password");
    }

    // Generate auth token (in a real app, this would be a JWT or similar)
    const token = `token_${Math.random().toString(36).substr(2, 10)}_${Date.now()}`;

    // Calculate expiry (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + TOKEN_EXPIRY_DAYS);

    // Create auth data
    const authData = {
      token,
      expiresAt: expiresAt.toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationName: user.organizationName,
      },
    };

    // Save auth data
    setLocalData(STORAGE_KEYS.AUTH_TOKEN, authData);
    setCookie(AUTH_COOKIE, token, TOKEN_EXPIRY_DAYS);

    return authData;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

/**
 * Sign out the current user
 */
export const signOut = () => {
  try {
    // Remove auth data
    removeLocalData(STORAGE_KEYS.AUTH_TOKEN);
    removeCookie(AUTH_COOKIE);
    return true;
  } catch (error) {
    console.error("Error signing out:", error);
    return false;
  }
};

/**
 * Update user profile
 * @param {Object} profileData - Updated profile data
 * @returns {Object} - Updated user data
 */
export const updateProfile = async (profileData) => {
  try {
    // Get current user
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error("You must be signed in to update your profile");
    }

    // Get users
    const users = getLocalData(STORAGE_KEYS.USER_DATA) || [];

    // Find user
    const userIndex = users.findIndex((user) => user.id === currentUser.id);

    if (userIndex === -1) {
      throw new Error("User not found");
    }

    // Update user data
    const updatedUser = {
      ...users[userIndex],
      ...profileData,
      updatedAt: new Date().toISOString(),
    };

    // Update password if provided
    if (profileData.newPassword) {
      updatedUser.password = profileData.newPassword;
    }

    // Save updated user
    users[userIndex] = updatedUser;
    setLocalData(STORAGE_KEYS.USER_DATA, users);

    // Update auth data
    const authData = getLocalData(STORAGE_KEYS.AUTH_TOKEN);

    if (authData && authData.user.id === currentUser.id) {
      const { password: _pwd, ...userWithoutPassword } = updatedUser;

      authData.user = {
        ...userWithoutPassword,
      };

      setLocalData(STORAGE_KEYS.AUTH_TOKEN, authData);
    }

    // Return updated user (without password)
    const { password: _p, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};
