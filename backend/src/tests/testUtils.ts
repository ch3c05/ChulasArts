/**
 * Test Utilities
 * Helper functions for backend tests
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

/**
 * Connect to in-memory MongoDB for testing
 */
export const connectTestDatabase = async (): Promise<void> => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
};

/**
 * Disconnect and stop in-memory MongoDB
 */
export const disconnectTestDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  await mongoServer.stop();
};

/**
 * Clear all collections in test database
 */
export const clearTestDatabase = async (): Promise<void> => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

/**
 * Create a test user for authentication
 */
export const createTestUser = async (overrides = {}) => {
  const { User } = await import('../models/User.js');
  const { hashPassword } = await import('../utils/password.js');

  const defaultUser = {
    email: 'test@example.com',
    passwordHash: await hashPassword('Test123!@#'),
    username: 'testuser',
    displayName: 'Test User',
    ...overrides,
  };

  return User.create(defaultUser);
};

/**
 * Generate test JWT token for authenticated requests
 */
export const generateTestToken = (userId: string, email: string): string => {
  const { generateAccessToken } = require('../utils/jwt.js');
  return generateAccessToken(userId, email);
};
