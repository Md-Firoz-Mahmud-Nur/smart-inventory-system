const JWT_SECRET = process.env.NEXT_PUBLIC_API_URL
  ? "jwt-from-backend"
  : "dev-secret";

export interface JWTPayload {
  userId: string;
  email?: string;
  iat?: number;
  exp?: number;
}

// Parse JWT token (client-side verification only, full verification happens on backend)
export function parseToken(token: string): JWTPayload | null {
  try {
    // Simple base64 decode of JWT payload (not cryptographic verification)
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    const payload = JSON.parse(jsonPayload);
    return payload as JWTPayload;
  } catch (error) {
    return null;
  }
}

// Get token from localStorage (set by backend via Set-Cookie header)
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("auth-token") || null;
  } catch (error) {
    return null;
  }
}

// Store token in localStorage (set by login/signup responses)
export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("auth-token", token);
  } catch (error) {
    console.error("Failed to store auth token");
  }
}

// Clear auth token
export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("auth-token");
  } catch (error) {
    console.error("Failed to clear auth token");
  }
}

// Get user from stored token
export function getUserFromToken(): JWTPayload | null {
  const token = getAuthToken();
  if (!token) return null;
  return parseToken(token);
}
