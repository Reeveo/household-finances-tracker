/**
 * User roles enum
 */
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
}

/**
 * User interface
 */
export interface User {
  id: number;
  username: string;
  password: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  createdAt: Date | null;
  lastLoginAt?: Date | null;
  failedLoginAttempts?: number;
  lockedUntil?: Date | null;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string | null;
  lastPasswordChange?: Date | null;
  lastProfileUpdate?: Date | null;
  lastSecuritySettingsUpdate?: Date | null;
}
