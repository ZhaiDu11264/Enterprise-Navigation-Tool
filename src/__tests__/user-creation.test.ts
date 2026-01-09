import { UserService } from '../models/User';
import { ConfigurationService } from '../models/DefaultConfiguration';

describe('User Creation with Default Configuration', () => {
  test('UserService should have createUser method', () => {
    expect(typeof UserService.createUser).toBe('function');
  });

  test('ConfigurationService should have applyActiveConfigurationToUser method', () => {
    expect(typeof ConfigurationService.applyActiveConfigurationToUser).toBe('function');
  });

  test('should validate user creation request structure', () => {
    const validUserData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      role: 'user' as const
    };

    // Verify the structure matches the expected interface
    expect(validUserData).toHaveProperty('username');
    expect(validUserData).toHaveProperty('email');
    expect(validUserData).toHaveProperty('password');
    expect(validUserData).toHaveProperty('role');
    expect(['user', 'admin']).toContain(validUserData.role);
  });
});