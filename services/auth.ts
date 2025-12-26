import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@impostr_token';
const USER_KEY = '@impostr_user';

export interface User {
  id: string;
  email: string;
  name: string;
  nickname: string;
}

export async function saveToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving token:', error);
    throw new Error('Failed to save authentication token');
  }
}

export async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
}

export async function clearToken(): Promise<void> {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error clearing token:', error);
  }
}

export async function saveUser(user: User): Promise<void> {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user:', error);
    throw new Error('Failed to save user data');
  }
}

export async function getUser(): Promise<User | null> {
  try {
    const userJson = await AsyncStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

export async function clearUser(): Promise<void> {
  try {
    await AsyncStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Error clearing user:', error);
  }
}

export async function clearAuth(): Promise<void> {
  await Promise.all([clearToken(), clearUser()]);
}
