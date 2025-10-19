/**
 * Example Backend Test
 * Demonstrates testing setup with Vitest and in-memory MongoDB
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  connectTestDatabase,
  disconnectTestDatabase,
  clearTestDatabase,
  createTestUser,
} from './testUtils.js';

describe('Example Backend Test Suite', () => {
  beforeAll(async () => {
    await connectTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  describe('Database Connection', () => {
    it('should connect to in-memory MongoDB', async () => {
      const { default: mongoose } = await import('mongoose');
      expect(mongoose.connection.readyState).toBe(1); // 1 = connected
    });
  });

  describe('User Model', () => {
    it('should create a test user', async () => {
      const user = await createTestUser();

      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.username).toBe('testuser');
      expect(user.displayName).toBe('Test User');
    });

    it('should enforce unique email constraint', async () => {
      await createTestUser();

      await expect(createTestUser({ username: 'differentuser' })).rejects.toThrow();
    });
  });

  describe('Password Utilities', () => {
    it('should hash and compare passwords correctly', async () => {
      const { hashPassword, comparePassword } = await import('../utils/password.js');

      const plainPassword = 'Test123!@#';
      const hashed = await hashPassword(plainPassword);

      expect(hashed).not.toBe(plainPassword);
      expect(await comparePassword(plainPassword, hashed)).toBe(true);
      expect(await comparePassword('WrongPassword', hashed)).toBe(false);
    });
  });

  describe('JWT Utilities', () => {
    it('should generate and verify JWT tokens', async () => {
      const { generateAccessToken, verifyToken } = await import('../utils/jwt.js');

      const userId = '507f1f77bcf86cd799439011';
      const email = 'test@example.com';

      const token = generateAccessToken(userId, email);
      const decoded = verifyToken(token);

      expect(decoded.userId).toBe(userId);
      expect(decoded.email).toBe(email);
      expect(decoded.type).toBe('access');
    });
  });
});
