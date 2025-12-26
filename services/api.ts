const API_BASE_URL = "https://impostr-backend-production.up.railway.app";

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  nickname: string;
}

export interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    nickname: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
}

export interface RefreshResponse {
  token: string;
  refreshToken: string;
}

export class ApiError extends Error {
  constructor(message: string, public statusCode?: number, public data?: any) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    let errorData;

    try {
      errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // If response is not JSON, use status text
    }

    throw new ApiError(errorMessage, response.status, errorData);
  }

  return response.json();
}

export async function register(
  data: RegisterRequest
): Promise<RegisterResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return handleResponse<RegisterResponse>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Network error. Please check your connection.");
  }
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return handleResponse<LoginResponse>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Network error. Please check your connection.");
  }
}

export async function refreshSession(
  refreshToken: string
): Promise<RefreshResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    return handleResponse<RefreshResponse>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Network error. Please check your connection.");
  }
}

// Game Session Types
export interface Player {
  userId: string;
  nickname: string;
  isHost: boolean;
  joinedAt: string;
}

export interface SessionConfig {
  maxPlayers: number;
  imposterCount: number;
  timeLimit?: number;
}

export interface GameSession {
  roomCode: string;
  hostId: string;
  players: Player[];
  config: SessionConfig;
  state: "LOBBY" | "PLAYING" | "VOTING" | "ENDED";
  createdAt: string;
}

export interface CreateSessionRequest {
  maxPlayers: number;
  imposterCount: number;
  timeLimit?: number;
}

export interface JoinSessionRequest {
  roomCode: string;
}

// Game API Functions
export async function createSession(
  token: string,
  data: CreateSessionRequest
): Promise<GameSession> {
  try {
    const response = await fetch(`${API_BASE_URL}/game/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    return handleResponse<GameSession>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Network error. Please check your connection.");
  }
}

export async function joinSession(
  token: string,
  data: JoinSessionRequest
): Promise<GameSession> {
  try {
    const response = await fetch(`${API_BASE_URL}/game/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    return handleResponse<GameSession>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Network error. Please check your connection.");
  }
}

export async function getSession(
  token: string,
  roomCode: string
): Promise<GameSession> {
  try {
    const response = await fetch(`${API_BASE_URL}/game/${roomCode}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return handleResponse<GameSession>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Network error. Please check your connection.");
  }
}
