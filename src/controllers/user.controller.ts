import { Request, Response, NextFunction } from 'express';
import { userService, QueryUserInput } from '../services';
import asyncHandler from '../middlewares/asyncHandler';

const createUser = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = await userService.createUser(req.body);
    res.status(201).json({
      status: 'success',
      data: user,
    });
  }
);

const getUser = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = await userService.getUserById(req.params.userId);
    res.status(200).json({
      status: 'success',
      data: user,
    });
  }
);

const updateUser = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = await userService.updateUserById(req.params.userId, req.body);
    res.status(200).json({
      status: 'success',
      data: user,
    });
  }
);

const deleteUser = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    await userService.deleteUserById(req.params.userId);
    res.status(204).send();
  }
);

const getUsers = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const filter = req.query as unknown as QueryUserInput;
    const result = await userService.queryUsers(filter);

    res.status(200).json({
      status: 'success',
      data: result.users,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: Math.ceil(result.total / result.limit),
      },
    });
  }
);

export default {
  createUser,
  getUser,
  updateUser,
  deleteUser,
  getUsers,
};
