import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { setupTestDatabase, teardownTestDatabase, createTestUser, getSessionCookie } from '../setup.js';

describe('Phase 1: Authentication Tests', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await setupTestDatabase();
  });

  describe('POST /api/auth/register', () => {
    test('should successfully register a new user', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        name: 'New User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Registration successful',
        user: {
          email: userData.email,
          name: userData.name
        }
      });

      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('createdAt');
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.user).not.toHaveProperty('password_hash');

      // Verify session cookie is set
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some(cookie => cookie.startsWith('connect.sid='))).toBe(true);
    });

    test('should reject duplicate email registration', async () => {
      // Create first user
      await createTestUser('duplicate@example.com', 'password123', 'First User');

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'DifferentPass123!',
          name: 'Second User'
        })
        .expect('Content-Type', /json/)
        .expect(409);

      expect(response.body).toMatchObject({
        success: false,
        message: 'User with this email already exists'
      });
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com'
          // Missing password and name
        })
        .expect('Content-Type', /json/);

      expect(response.body.success).toBe(false);
    });

    test('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email-format',
          password: 'SecurePass123!',
          name: 'Test User'
        });

      // Should fail validation (exact status depends on your validation middleware)
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create test user before each login test
      await createTestUser('login@example.com', 'password123', 'Login User');
    });

    test('should successfully login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123'
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Login successful',
        user: {
          email: 'login@example.com',
          name: 'Login User'
        }
      });

      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.user).not.toHaveProperty('password_hash');

      // Verify session cookie is set
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some(cookie => cookie.startsWith('connect.sid='))).toBe(true);
    });

    test('should reject login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WrongPassword123!'
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Invalid email or password'
      });
    });

    test('should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Invalid email or password'
      });
    });

    test('should validate required login fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
          // Missing password
        })
        .expect('Content-Type', /json/);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    test('should successfully logout authenticated user', async () => {
      // First, login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: await createTestUser('logout@example.com', 'password123').then(u => u.email),
          password: 'password123'
        });

      const sessionCookie = getSessionCookie(loginResponse);

      // Then logout
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', sessionCookie)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Logout successful'
      });
    });

    test('should handle logout without session gracefully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect('Content-Type', /json/);

      // Should not crash, might return 200 or 401 depending on implementation
      expect(response.status).toBeLessThan(500);
    });
  });

  describe('GET /api/auth/me', () => {
    test('should return current user when authenticated', async () => {
      // Create user and login
      const user = await createTestUser('me@example.com', 'password123', 'Me User');
      
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'me@example.com',
          password: 'password123'
        });

      const sessionCookie = getSessionCookie(loginResponse);

      // Get current user
      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', sessionCookie)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        user: {
          id: user.id,
          email: 'me@example.com',
          name: 'Me User'
        }
      });

      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.user).not.toHaveProperty('password_hash');
    });

    test('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Session Persistence', () => {
    test('should maintain session across multiple requests', async () => {
      // Login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: await createTestUser('session@example.com', 'password123').then(u => u.email),
          password: 'password123'
        });

      const sessionCookie = getSessionCookie(loginResponse);

      // Make multiple requests with the same session
      const response1 = await request(app)
        .get('/api/auth/me')
        .set('Cookie', sessionCookie)
        .expect(200);

      const response2 = await request(app)
        .get('/api/auth/me')
        .set('Cookie', sessionCookie)
        .expect(200);

      // Both should return the same user
      expect(response1.body.user.id).toBe(response2.body.user.id);
    });
  });
});
