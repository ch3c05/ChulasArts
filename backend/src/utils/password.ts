/**
 * Password Utilities
 *
 * Handles password hashing and verification using bcrypt
 * Used for user authentication
 */

import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

/**
 * Hash a plain text password
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare plain text password with hashed password
 * @param password - Plain text password
 * @param hashedPassword - Hashed password from database
 * @returns True if passwords match
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Validate password strength
 * Requires: 8+ chars, uppercase, lowercase, number, special char
 * @param password - Password to validate
 * @returns True if password meets requirements
 */
export function isPasswordStrong(password: string): boolean {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
  );
}

/**
 * Get password strength validation message
 * @returns Validation requirements message
 */
export function getPasswordRequirements(): string {
  return 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character';
}
