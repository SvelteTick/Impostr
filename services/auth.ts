import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { refreshSession } from "./api";

const TOKEN_KEY = "@impostr_token";
const REFRESH_TOKEN_KEY = "@impostr_refresh_token";
const USER_KEY = "@impostr_user";

export interface DecodedToken {
  exp: number;
  iat: number;
  sub: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  nickname: string;
}

export async function saveToken(
  token: string,
  refreshToken?: string
): Promise<void> {
  try {
    const promises = [AsyncStorage.setItem(TOKEN_KEY, token)];
    if (refreshToken) {
      promises.push(AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken));
    }
    await Promise.all(promises);
  } catch (error) {
    console.error("Error saving token:", error);
    throw new Error("Failed to save authentication token");
  }
}

export async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    return null;
  }
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    return null;
  }
}

export async function clearAuth(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
  } catch (error) {
    console.error("Error clearing auth:", error);
  }
}

export async function isTokenValid(): Promise<boolean> {
  try {
    const token = await getToken();
    if (!token) return false;

    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;

    if (decoded.exp > currentTime) {
      return true;
    }

    console.log("Access token expired, attempting refresh...");
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      await clearAuth();
      return false;
    }

    // Verify refresh token expiry locally
    try {
      const decodedRefresh = jwtDecode<DecodedToken>(refreshToken);
      if (decodedRefresh.exp < currentTime) {
        console.log("Refresh token also expired");
        await clearAuth();
        return false;
      }
    } catch (e) {
      // Ignore decode error, let server decide
    }

    try {
      const response = await refreshSession(refreshToken);
      if (response.token) {
        await saveToken(response.token, response.refreshToken || refreshToken);
        console.log("Session refreshed successfully");
        return true;
      }
    } catch (apiError) {
      console.error("Failed to refresh session:", apiError);
    }

    await clearAuth();
    return false;
  } catch (error) {
    console.error("Error validating token:", error);
    await clearAuth();
    return false;
  }
}

export async function saveUser(user: User): Promise<void> {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("Error saving user:", error);
    throw new Error("Failed to save user data");
  }
}

export async function getUser(): Promise<User | null> {
  try {
    const userJson = await AsyncStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
}
