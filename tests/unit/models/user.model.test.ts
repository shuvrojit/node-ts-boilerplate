import mongoose from 'mongoose';
import { User } from '../../../src/models';
import bcrypt from 'bcryptjs';

// Mock bcrypt to avoid actual hashing in tests
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockImplementation((candidatePassword, userPassword) => {
    return Promise.resolve(
      candidatePassword === 'correct_password' &&
        userPassword === 'hashed_password'
    );
  }),
}));

describe('User Model', () => {
  let newUser: any;

  beforeAll(async () => {
    // Connect to MongoDB memory server
    await mongoose.connect(process.env.MONGODB_URL as string);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    newUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'user',
    };
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  it('should create a user successfully', async () => {
    const user = await User.create(newUser);
    expect(user).toBeDefined();
    expect(user.name).toBe(newUser.name);
    expect(user.email).toBe(newUser.email);
    expect(user.role).toBe(newUser.role);
    expect(user.isEmailVerified).toBe(false); // default value
  });

  it('should validate required fields', async () => {
    const incompleteUser = new User({});

    await expect(incompleteUser.validate()).rejects.toThrow();
    // Test for specific required field validations
    try {
      await incompleteUser.validate();
    } catch (error: any) {
      expect(error.errors.name).toBeDefined();
      expect(error.errors.email).toBeDefined();
      expect(error.errors.password).toBeDefined();
    }
  });

  it('should ensure email is unique', async () => {
    await User.create(newUser);

    // Try to create another user with the same email
    await expect(
      User.create({
        ...newUser,
        name: 'Another Name', // Different name, same email
      })
    ).rejects.toThrow();
  });

  it('should hash password before saving', async () => {
    const user = await User.create(newUser);

    // Check if bcrypt.hash was called
    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).toHaveBeenCalledWith(newUser.password, 'salt');
    expect(user.password).toBe('hashed_password');
  });

  it('should not hash password if it is not modified', async () => {
    const user = await User.create(newUser);

    // Reset mock calls count
    (bcrypt.genSalt as jest.Mock).mockClear();
    (bcrypt.hash as jest.Mock).mockClear();

    user.name = 'Updated Name';
    await user.save();

    // Should not call hash again
    expect(bcrypt.genSalt).not.toHaveBeenCalled();
    expect(bcrypt.hash).not.toHaveBeenCalled();
  });

  it('should correctly compare password', async () => {
    const user = await User.create(newUser);

    const isMatch1 = await user.comparePassword('correct_password');
    expect(isMatch1).toBe(true);
    expect(bcrypt.compare).toHaveBeenCalledWith(
      'correct_password',
      'hashed_password'
    );

    const isMatch2 = await user.comparePassword('wrong_password');
    expect(isMatch2).toBe(false);
  });

  it('should have timestamps', async () => {
    const user = await User.create(newUser);
    expect(user.createdAt).toBeDefined();
    expect(user.updatedAt).toBeDefined();
  });

  it('should validate email format', async () => {
    const userWithInvalidEmail = new User({
      ...newUser,
      email: 'invalid-email',
    });

    await expect(userWithInvalidEmail.validate()).rejects.toThrow();
  });

  it('should validate password min length', async () => {
    const userWithShortPassword = new User({
      ...newUser,
      password: 'short',
    });

    await expect(userWithShortPassword.validate()).rejects.toThrow();
  });

  it('should validate role enum values', async () => {
    const userWithInvalidRole = new User({
      ...newUser,
      role: 'invalid-role',
    });

    await expect(userWithInvalidRole.validate()).rejects.toThrow();
  });
});
