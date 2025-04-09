import { Request, Response } from 'express';
import { userController } from '../../../src/controllers';
import { userService } from '../../../src/services';
import mongoose from 'mongoose';

// Mock the userService
jest.mock('../../../src/services', () => ({
  userService: {
    createUser: jest.fn(),
    getUserById: jest.fn(),
    updateUserById: jest.fn(),
    deleteUserById: jest.fn(),
    queryUsers: jest.fn(),
  },
}));

describe('UserController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a user and return 201 status', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const mockUser = {
        _id: userId,
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
      };

      mockRequest.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      (userService.createUser as jest.Mock).mockResolvedValueOnce(mockUser);

      await userController.createUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(userService.createUser).toHaveBeenCalledWith(mockRequest.body);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockUser,
      });
    });

    // TODO: fix this test
    it('should call next with error if service throws', async () => {
      const error = new Error('Database error');
      mockRequest.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      (userService.createUser as jest.Mock).mockRejectedValueOnce(error);

      // Call the controller and wait for it to complete
      await userController.createUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Check that next was called with the error and no response was sent
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('getUser', () => {
    it('should get a user and return 200 status', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const mockUser = {
        _id: userId,
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
      };

      mockRequest.params = {
        userId,
      };

      (userService.getUserById as jest.Mock).mockResolvedValueOnce(mockUser);

      await userController.getUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(userService.getUserById).toHaveBeenCalledWith(userId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockUser,
      });
    });
  });

  describe('updateUser', () => {
    it('should update a user and return 200 status', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const mockUser = {
        _id: userId,
        name: 'Updated User',
        email: 'test@example.com',
        role: 'user',
      };

      mockRequest.params = {
        userId,
      };

      mockRequest.body = {
        name: 'Updated User',
      };

      (userService.updateUserById as jest.Mock).mockResolvedValueOnce(mockUser);

      await userController.updateUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(userService.updateUserById).toHaveBeenCalledWith(
        userId,
        mockRequest.body
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockUser,
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete a user and return 204 status', async () => {
      const userId = new mongoose.Types.ObjectId().toString();

      mockRequest.params = {
        userId,
      };

      (userService.deleteUserById as jest.Mock).mockResolvedValueOnce(
        undefined
      );

      await userController.deleteUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(userService.deleteUserById).toHaveBeenCalledWith(userId);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });
  });

  describe('getUsers', () => {
    it('should get users with pagination and return 200 status', async () => {
      const mockUsers = [
        {
          _id: new mongoose.Types.ObjectId().toString(),
          name: 'User 1',
          email: 'user1@example.com',
          role: 'user',
        },
        {
          _id: new mongoose.Types.ObjectId().toString(),
          name: 'User 2',
          email: 'user2@example.com',
          role: 'admin',
        },
      ];

      const mockQueryResult = {
        users: mockUsers,
        total: 2,
        page: 1,
        limit: 10,
      };

      mockRequest.query = {
        page: '1',
        limit: '10',
      };

      (userService.queryUsers as jest.Mock).mockResolvedValueOnce(
        mockQueryResult
      );

      await userController.getUsers(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(userService.queryUsers).toHaveBeenCalledWith(mockRequest.query);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockUsers,
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          pages: 1,
        },
      });
    });
  });
});
