/**
 * Authentication types
 * Defines all auth-related interfaces and enums
 */

export enum UserRole {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

export interface AuthUser {
  id: string
  sequence_id: string
  public_name: string
  level: number
}

export interface AuthSession {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// credentials are not used in this model; authentication via sequence_id only
export interface AuthCredentials {}

export interface SignUpData extends AuthCredentials {
  username: string
}

// new type used by hash login page
export type HashCredential = string

export interface AuthState extends AuthSession {
  // login now accepts a hash string and returns the authenticated user object.
  login: (hash: string) => Promise<AuthUser>
  signup: (data: SignUpData) => Promise<AuthUser>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}
